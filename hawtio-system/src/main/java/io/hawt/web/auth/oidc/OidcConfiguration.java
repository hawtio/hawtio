/*
 * Copyright 2024 hawt.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web.auth.oidc;

import java.io.File;
import java.io.IOException;
import java.math.BigInteger;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.KeyFactory;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.PublicKey;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import javax.security.auth.login.AppConfigurationEntry;
import javax.security.auth.login.Configuration;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.proc.JWKSecurityContext;
import io.hawt.util.Strings;
import io.hawt.web.auth.RolePrincipal;
import io.hawt.web.auth.oidc.token.ValidAccessToken;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.utils.URIUtils;
import org.apache.http.config.ConnectionConfig;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.config.SocketConfig;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.ContentType;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.message.BasicHttpRequest;
import org.apache.http.ssl.PrivateKeyStrategy;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.jolokia.json.JSONArray;
import org.jolokia.json.parser.JSONParser;
import org.jolokia.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuration of OpenID Connect.
 */
public class OidcConfiguration extends Configuration {

    public static final Logger LOG = LoggerFactory.getLogger(OidcConfiguration.class);

    public static final String OIDC_JAAS_CONFIGURATION = "OidcConfiguration";

    /**
     * Provider name - used when displaying OIDC as login method in Hawtio client application
     */
    private String name;

    /**
     * URL for the provider. Must be the base part where {@code .well-known/openid-configuration} can be appended
     */
    private URL providerURL;

    /**
     * OAuth2/OpenIDConnect client identifier (GUID for Entra ID)
     */
    private String clientId;

    /**
     * {@code response_mode} parameter for Authorization Endpoint
     */
    private ResponseMode responseMode;

    /**
     * Scopes to be sent to Authorization Endpoint. Must include {@code openid}.
     */
    private String[] scopes;

    /**
     * {@code redirect_uri} sent to Authorization Endpoint. Must be properly configured at the provider side.
     */
    private URL redirectUri;

    /**
     * {@code code_challenge_method} according to <a href="https://datatracker.ietf.org/doc/html/rfc7636#section-4.2">RFC 7636, "Proof Key for Code Exchange"</a>.
     * {@code null} indicates no PKCE used.
     */
    private String codeChallengeMethod;

    /**
     * A hint for Authorization Endpoint about the type of login form presented.
     * See <a href="https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest">OpenID Connect, 3.1.2.1. Authentication Request</a>
     */
    private PromptType prompt;

    /**
     * Serialized version of the configuration, to be consumed by hawtio-react
     */
    private String json;

    private AppConfigurationEntry[] jaasAppConfigurationEntries;

    /**
     * When we can set this URL, it means everything that's needed to validate JWT access tokens is available.
     */
    private URL jwksURL;

    private final Set<String> supportedECCurves = Set.of("P-256", "P-384", "P-521");

    private final Map<String, PublicKey> publicKeys = new ConcurrentHashMap<>();
    private volatile long cacheTime;
    private volatile long lastCheck = 0L;

    private CloseableHttpClient httpClient;
    private Class<? extends Principal> roleClass;

    private String rolesPathConfig;
    private String[] rolesPath;
    private final Map<String, String> roleMapping = new HashMap<>();

    // a context used to validate JWT tokens using Nimbus JOSE library
    private JWKSecurityContext jwkContext;

    // for tests
    private boolean offline;

    public OidcConfiguration(String realm, Properties props) throws IOException {
        String provider = props.getProperty("provider");
        if (Strings.isBlank(provider)) {
            // means there's no OIDC configuration
            return;
        }

        // client-side configuration

        providerURL = new URL(provider);
        clientId = props.getProperty("client_id");
        responseMode = ResponseMode.fromString(props.getProperty("response_mode"));
        String redirectUri = props.getProperty("redirect_uri");
        if (Strings.isNotBlank(redirectUri)) {
            this.redirectUri = new URL(redirectUri);
        }
        codeChallengeMethod = props.getProperty("code_challenge_method");
        String scopes = props.getProperty("scope");
        if (scopes == null) {
            this.scopes = new String[0];
        } else {
            this.scopes = Arrays.stream(scopes.split("\\s+"))
                    .map(String::trim).toArray(String[]::new);
        }
        prompt = PromptType.fromString(props.getProperty("prompt"));

        name = props.getProperty("name");
        if (name == null || name.isBlank()) {
            name = providerURL.toExternalForm();
        }

        // server-side configuration

        String jwksCacheTime = props.getProperty("jwks.cacheTime");
        if (jwksCacheTime != null) {
            try {
                int minutes = Integer.parseInt(jwksCacheTime);
                LOG.debug("Setting public key cache time to {} minutes", minutes);
                cacheTime = minutes * 60 * 1000L;
            } catch (NumberFormatException e) {
                LOG.warn("Illegal value of min-time-between-jwks-requests property. Defaulting to 60 minutes.");
                cacheTime = 60 * 60 * 1000L;
            }
        }

        String rolesPath = props.getProperty("oidc.rolesPath");
        if (rolesPath == null || rolesPath.isBlank()) {
            LOG.info("No oidc.rolesPath configured. Defaults to \"roles\".");
            rolesPath = "roles";
        }
        this.rolesPathConfig = Strings.resolvePlaceholders(rolesPath, props);
        this.rolesPath = Arrays.stream(this.rolesPathConfig.split("\\.")).map(String::trim).toArray(String[]::new);

        for (String p : props.stringPropertyNames()) {
            if (!p.startsWith("roleMapping.")) {
                continue;
            }
            String jwtRole = p.substring("roleMapping.".length());
            String targetRole = props.getProperty(p);
            roleMapping.put(jwtRole, targetRole);
        }

        this.offline = booleanProperty(props, "offline", false);

        if (!offline) {
            buildHttpClient(props);
        }
        buildConfiguration(props);
    }

    @Override
    public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
        return jaasAppConfigurationEntries;
    }

    public URL getProviderURL() {
        return providerURL;
    }

    public String getName() {
        return name;
    }

    public String getClientId() {
        return clientId;
    }

    public ResponseMode getResponseMode() {
        return responseMode;
    }

    public String[] getScopes() {
        return scopes;
    }

    public URL getRedirectUri() {
        return redirectUri;
    }

    public String getCodeChallengeMethod() {
        return codeChallengeMethod;
    }

    public PromptType getPrompt() {
        return prompt;
    }

    public String[] getRolesPath() {
        return rolesPath;
    }

    public Class<?> getRoleClass() {
        return roleClass;
    }

    public Map<String, String> getRoleMapping() {
        return roleMapping;
    }

    /**
     * When token arrives, find a {@link PublicKey} based on {@code kid} field from JWT header.
     * @param kid
     * @return
     */
    public PublicKey findPublicKey(String kid) {
        return publicKeys.get(kid);
    }

    /**
     * Serialize to be returned by auth endpoint for client-side HawtIO.
     * @return
     */
    public String toJSON() {
        return this.json;
    }

    /**
     * Prepare an instance of {@link HttpClient} to be used with OpenID Connect provider
     * @param props
     */
    private void buildHttpClient(Properties props) {
        int connectionTimeout = integerProperty(props, "http.connectionTimeout", 5000);
        int readTimeout = integerProperty(props, "http.readTimeout", 10000);
        String proxy = stringProperty(props, "http.proxyURL", null);
        String protocol = stringProperty(props, "ssl.protocol", "TLSv1.3");
        String truststore = stringProperty(props, "ssl.truststore", null);
        String truststorePassword = stringProperty(props, "ssl.truststorePassword", "");
        String keystore = stringProperty(props, "ssl.keystore", null);
        String keystorePassword = stringProperty(props, "ssl.keystorePassword", "");
        String keyAlias = stringProperty(props, "ssl.keyAlias", null);
        String keyPassword = stringProperty(props, "ssl.keyPassword", "");

        RequestConfig.Builder requestConfigBuilder = RequestConfig.custom();
        requestConfigBuilder.setConnectTimeout(connectionTimeout);
        requestConfigBuilder.setSocketTimeout(readTimeout);
        SocketConfig.Builder socketConfigBuilder = SocketConfig.custom();
        socketConfigBuilder.setSoTimeout(readTimeout);
        ConnectionConfig.Builder connectionConfigBuilder = ConnectionConfig.custom();

        SSLConnectionSocketFactory csf;
        if (truststore == null && keystore == null) {
            csf = SSLConnectionSocketFactory.getSystemSocketFactory();
        } else {
            truststore = Strings.resolvePlaceholders(truststore);
            keystore = Strings.resolvePlaceholders(keystore);
            SSLContextBuilder sslContextBuilder = SSLContexts.custom();
            sslContextBuilder.setProtocol(protocol);

            try {
                sslContextBuilder.loadTrustMaterial((TrustStrategy) null);
            } catch (NoSuchAlgorithmException | KeyStoreException e) {
                throw new IllegalArgumentException("Problem loading default truststore", e);
            }
            if (truststore != null) {
                try {
                    sslContextBuilder.loadTrustMaterial(new File(truststore), truststorePassword.toCharArray());
                } catch (NoSuchAlgorithmException | KeyStoreException | CertificateException | IOException e) {
                    throw new IllegalArgumentException("Problem loading truststore from " + truststore, e);
                }
            }
            if (keystore != null) {
                try {
                    PrivateKeyStrategy pks = null;
                    if (keyAlias != null) {
                        pks = (aliases, socket) -> aliases.containsKey(keyAlias) ? keyAlias : null;
                    }
                    sslContextBuilder.loadKeyMaterial(new File(keystore),
                            keystorePassword.toCharArray(), keyPassword.toCharArray(), pks);
                } catch (NoSuchAlgorithmException | KeyStoreException | CertificateException | IOException |
                         UnrecoverableKeyException e) {
                    throw new IllegalArgumentException("Problem loading keystore from " + keystore, e);
                }
            }
            try {
                csf = new SSLConnectionSocketFactory(sslContextBuilder.build(), new DefaultHostnameVerifier());
            } catch (NoSuchAlgorithmException | KeyManagementException e) {
                throw new IllegalArgumentException("Can't create SSL Socket Factory", e);
            }
        }

        Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.getSocketFactory())
                .register("https", csf)
                .build();

        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setDefaultConnectionConfig(connectionConfigBuilder.build());
        connectionManager.setDefaultSocketConfig(socketConfigBuilder.build());
        connectionManager.setMaxTotal(20);
        connectionManager.setDefaultMaxPerRoute(connectionManager.getMaxTotal());

        HttpClientBuilder builder = HttpClients.custom();
        builder.useSystemProperties();
        builder.setDefaultCookieStore(new NopCookieStore());
        builder.setSSLSocketFactory(csf);
        builder.setConnectionManager(connectionManager);
        builder.setDefaultRequestConfig(requestConfigBuilder.build());
        if (proxy != null) {
            URI uri = URI.create(proxy);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();
            if (port <= 0) {
                if (scheme.equals("http")) {
                    port = 80;
                } else if (scheme.equals("https")) {
                    port = 443;
                } else {
                    LOG.warn("Invalid proxy definition: {}", proxy);
                }
            }
            if (port > 0) {
                builder.setProxy(new HttpHost(host, port, scheme));
            }
        }

        this.httpClient = builder.build();
    }

    /**
     * Prepares JSON configuration to be used by client side and JAAS configuration to be used by server side.
     *
     * @param props
     */
    private void buildConfiguration(Properties props) throws IOException {
        JSONObject json = new JSONObject();
        json.put("method", "oidc");
        if (providerURL != null) {
            json.put("provider", providerURL.toString());
        }
        json.put("client_id", clientId);
        if (responseMode != null) {
            json.put("response_mode", responseMode.asValue());
        }
        if (scopes != null) {
            json.put("scope", String.join(" ", scopes));
        }
        if (redirectUri != null) {
            json.put("redirect_uri", redirectUri.toString());
        }
        json.put("code_challenge_method", codeChallengeMethod);
        if (prompt != null) {
            json.put("prompt", prompt.asValue());
        }

        // we can fetch `/.well-known/openid-configuration` data to:
        // 1) cache it for the client side
        // 2) get jwks_uri for public key validation of JWTs
        String base = providerURL.toString();
        if (!base.endsWith("/")) {
            base += "/";
        }

        boolean fetchConfig = booleanProperty(props, "oidc.cacheConfig", true);
        if (!fetchConfig || this.offline) {
            LOG.info("OpenID Connect configuration will not be loaded for {}", base);
        } else {
            URL configurationURL = new URL(new URL(base), ".well-known/openid-configuration");
            JSONObject openidConfiguration = fetchJSON(configurationURL);

            if (openidConfiguration == null) {
                LOG.error("Problem getting OpenID Connect configuration. OpenID/OAuth2 authentication disabled.");
                json = new JSONObject(); // empty config
            } else {
                String jwksURI = (String) openidConfiguration.get("jwks_uri");
                if (jwksURI == null) {
                    LOG.error("No JWKS endpoint available - it is not possible to validate JWT access tokens. OpenID/OAuth2 authentication disabled.");
                    json = new JSONObject(); // empty config
                } else {
                    URL url = new URL(jwksURI);
                    JSONObject jwksConfiguration = fetchJSON(url);
                    if (jwksConfiguration == null) {
                        LOG.error("Problem getting JWKS configuration - it is not possible to validate JWT access tokens. OpenID/OAuth2 authentication disabled.");
                        json = new JSONObject(); // empty config
                    } else {
                        jwksURL = url;
                        cachePublicKeys(jwksConfiguration);
                        lastCheck = System.currentTimeMillis();
                    }
                }
            }

            if (jwksURL != null) {
                // everything is fine, we can attach entire .well-known/openid-configuration to the JSON
                // presented to hawtio client side
                json.put("openid-configuration", openidConfiguration);
            }
        }

        this.json = json.toString();

        // add SUFFICIENT entry, so we can proceed with other modules if these are present
        this.jaasAppConfigurationEntries = new AppConfigurationEntry[] {
                new AppConfigurationEntry(OidcLoginModule.class.getName(),
                        AppConfigurationEntry.LoginModuleControlFlag.SUFFICIENT, Map.of(OIDC_JAAS_CONFIGURATION, this))
        };
    }

    public boolean isEnabled() {
        return getProviderURL() != null;
    }

    public JWKSecurityContext getJwkContext() {
        return jwkContext;
    }

    public void refreshPublicKeysIfNeeded() {
        if (lastCheck + cacheTime > System.currentTimeMillis()) {
            return;
        }

        if (jwksURL != null) {
            JSONObject jwksConfiguration = fetchJSON(jwksURL);
            if (jwksConfiguration != null) {
                cachePublicKeys(jwksConfiguration);
            }
        }

        lastCheck = System.currentTimeMillis();
    }

    /**
     * Cache information coming from {@code jwks_uri} endpoint
     * @param config
     */
    public void cachePublicKeys(JSONObject config) {
        publicKeys.clear();
        List<JWK> contextKeys = new ArrayList<>();
        try {
            JSONArray keys = (JSONArray) config.get("keys");
            if (keys != null) {
                for (int k = 0; k < keys.size(); k++) {
                    JSONObject key = (JSONObject) keys.get(k);
                    String type = key.containsKey("kty") ? (String) key.get("kty") : null;
                    String kid = key.containsKey("kid") ? key.get("kid").toString() : null;
                    if (type == null || kid == null) {
                        LOG.warn("Invalid key definition: {}", key.toString());
                        continue;
                    }
                    if ("RSA".equals(type)) {
                        // manually
                        // https://www.rfc-editor.org/rfc/rfc7518.html#section-6.3
                        String n = key.containsKey("n") ? (String) key.get("n") : null;
                        String e = key.containsKey("e") ? (String) key.get("e") : null;
                        if (n == null || e == null) {
                            LOG.warn("Invalid RSA key definition: {}", key.toString());
                            continue;
                        }
                        try {
                            JWK jwk = JWK.parse(key);
                            if (jwk.getKeyUse() == KeyUse.SIGNATURE) {
                                cacheRSAKey(key);
                                contextKeys.add(jwk);
                            }
                        } catch (ParseException ex) {
                            LOG.warn("Problem parsing RSA key: {}", ex.getMessage());
                        }
                    } else if ("EC".equals(type)) {
                        // using Nimbusds
                        // https://www.rfc-editor.org/rfc/rfc7518.html#section-6.2
                        String crv = key.containsKey("crv") ? (String) key.get("crv") : null; // P-256, P-384 or P-521
                        if (crv == null || !supportedECCurves.contains(crv)) {
                            LOG.warn("Unsupported \"crv\" parameter for EC key: {}", crv);
                            continue;
                        }
                        String x = key.containsKey("x") ? (String) key.get("x") : null;
                        String y = key.containsKey("y") ? (String) key.get("y") : null;
                        if (x == null || y == null) {
                            LOG.warn("Invalid EC key definition: {}", key.toString());
                            continue;
                        }
                        try {
                            JWK jwk = JWK.parse(key);
                            if (jwk.getKeyUse() == KeyUse.SIGNATURE) {
                                cacheECKey(key, jwk.toECKey().toECPublicKey());
                                contextKeys.add(jwk);
                            }
                        } catch (ParseException | JOSEException e) {
                            LOG.warn("Problem parsing EC key: {}", e.getMessage());
                        }
                    }
                }
            }

            this.jwkContext = new JWKSecurityContext(contextKeys);
        } catch (Exception e) {
            LOG.error("Problem caching public keys: {}", e.getMessage());
        }
    }

    /**
     * Fetch JSON object from given URL
     * @param url
     * @return
     */
    private JSONObject fetchJSON(URL url) {
        try {
            BasicHttpRequest get = new BasicHttpRequest("GET", url.toURI().toString());
            LOG.info("Fetching data: {}", get.getRequestLine());
            try (CloseableHttpResponse res = httpClient.execute(URIUtils.extractHost(url.toURI()), get)) {
                if (res.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
                    LOG.error("Invalid response from {}: {}", url, res.getStatusLine());
                    return null;
                }
                HttpEntity entity = res.getEntity();
                if (entity != null) {
                    ContentType ct = ContentType.get(entity);
                    if (!ct.getMimeType().equals(ContentType.APPLICATION_JSON.getMimeType())) {
                        LOG.warn("Expected {}, got {}", ContentType.APPLICATION_JSON, ct);
                    } else {
                        return (JSONObject) new JSONParser().parse(EntityUtils.toString(entity,
                                ct.getCharset() == null ? Charset.defaultCharset() : ct.getCharset()));
                    }
                }
                return null;
            }
        } catch (URISyntaxException e) {
            LOG.error("Problem with URI {}", url, e);
            return null;
        } catch (IOException | org.jolokia.json.parser.ParseException e) {
            LOG.error("Problem connecting to {}", url, e);
            return null;
        }
    }

    private void cacheRSAKey(JSONObject key) {
        String kid = (String) key.get("kid");
        String nv = (String) key.get("n");
        String ev = (String) key.get("e");

        BigInteger n = new BigInteger(1, Base64.getUrlDecoder().decode(nv));
        BigInteger e = new BigInteger(1, Base64.getUrlDecoder().decode(ev));

        KeySpec publicKeySpec = new RSAPublicKeySpec(n, e);
        try {
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PublicKey publicKey = kf.generatePublic(publicKeySpec);
            this.publicKeys.put(kid, publicKey);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            LOG.warn("Can't cache RSA public key: {}", ex.getMessage());
        }
    }

    private void cacheECKey(JSONObject key, PublicKey publicKey) {
        String kid = (String) key.get("kid");
        this.publicKeys.put(kid, publicKey);
    }

    private int integerProperty(Properties props, String key, int defaultValue) {
        String v = props.getProperty(key);
        if (v == null || v.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(v);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private String stringProperty(Properties props, String key, String defaultValue) {
        String v = props.getProperty(key);
        if (v == null || v.isBlank()) {
            return defaultValue;
        }
        return v;
    }

    private boolean booleanProperty(Properties props, String key, boolean defaultValue) {
        String v = props.getProperty(key);
        if (v == null || v.isBlank()) {
            return defaultValue;
        }
        return v.equalsIgnoreCase("true");
    }

    /**
     * Configure roles available for OIDC. This is not part of the configuration file, as HawtIO takes the roles
     * from {@code hawtio.roles} property which defaults to {@code admin,manager,viewer}
     *
     * @param rolePrincipalClass
     */
    public void setRolePrincipalClass(Class<? extends Principal> rolePrincipalClass) {
        this.roleClass = rolePrincipalClass == null ? RolePrincipal.class : rolePrincipalClass;
    }

    /**
     * Extract roles (and maps them if needed) from Access Token according to current configuration
     *
     * @param parsedToken
     * @return
     */
    @SuppressWarnings("unchecked")
    public String[] extractRoles(ValidAccessToken parsedToken) {
        Set<String> roles = new LinkedHashSet<>();
        try {
            Map<String, Object> claims = parsedToken.getJwt().getJWTClaimsSet().toJSONObject();

            String[] path = this.getRolesPath();
            for (int s = 0; s < path.length; s++) {
                String segment = path[s];
                Object _claims = claims.get(segment);
                if (s < path.length - 1) {
                    // expect object - another map
                    if (!(_claims instanceof Map)) {
                        LOG.warn("Wrong roles path for JWT: {}", this.rolesPathConfig);
                        break;
                    } else {
                        claims = (Map<String, Object>) _claims;
                    }
                } else {
                    // expect an array of roles
                    if (_claims instanceof String[]) {
                        roles.addAll(Arrays.asList((String[]) _claims));
                    } else if (_claims instanceof List) {
                        roles.addAll((List<String>) _claims);
                    } else {
                        LOG.warn("Wrong roles path for JWT: {}", this.rolesPathConfig);
                    }
                    break;
                }
            }

            // map the roles
            String[] actualRoles = new String[roles.size()];
            if (actualRoles.length == 0) {
                return actualRoles;
            }
            int idx = 0;
            for (String role : roles) {
                actualRoles[idx++] = this.roleMapping.getOrDefault(role, role);
            }

            return actualRoles;
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * See <a href="https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#ResponseModes">OAuth 2.0 Multiple Response Type Encoding Practices</a>
     */
    public enum ResponseMode {
        FRAGMENT("fragment"),
        QUERY("query");

        private final String mode;

        ResponseMode(String mode) {
            this.mode = mode;
        }

        public static ResponseMode fromString(String value) {
            if (Strings.isNotBlank(value)) {
                for (ResponseMode rm : values()) {
                    if (rm.mode.equals(value)) {
                        return rm;
                    }
                }
            }
            return null;
        }

        public String asValue() {
            return mode;
        }
    }

    /**
     * See <a href="https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest">OpenID Connect, 3.1.2.1. Authentication Request</a>
     */
    public enum PromptType {
        NONE("none"),
        LOGIN("login"),
        CONSENT("consent"),
        SELECT_ACCOUNT("select_account");

        private final String mode;

        PromptType(String mode) {
            this.mode = mode;
        }

        public static PromptType fromString(String value) {
            if (Strings.isNotBlank(value)) {
                for (PromptType rm : values()) {
                    if (rm.mode.equals(value)) {
                        return rm;
                    }
                }
            }
            return null;
        }

        public String asValue() {
            return mode;
        }
    }

}
