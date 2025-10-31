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
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.KeyManagementException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.cert.CertificateException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.KeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.text.ParseException;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.login.LoginContext;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyType;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.nimbusds.jose.proc.JWKSecurityContext;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.JWTParser;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import io.hawt.util.Strings;
import io.hawt.web.auth.RolePrincipal;
import io.hawt.web.auth.UserPrincipal;
import io.hawt.web.auth.oidc.token.BearerTokenCallback;
import io.hawt.web.auth.oidc.token.KidKeySelector;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.config.ConnectionConfig;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.config.SocketConfig;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.ssl.TrustStrategy;
import org.jolokia.json.JSONArray;
import org.jolokia.json.JSONObject;
import org.jolokia.json.parser.JSONParser;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

public class OidcConfigurationTest {

    public static final Logger LOG = LoggerFactory.getLogger(OidcConfigurationTest.class);

    @Test
    public void urls() throws MalformedURLException {
        String provider = "https://login.microsoftonline.com/00000000-1111-2222-3333-444444444444/v2.0/";
        URL providerURL = new URL(provider);
        URL wellKnown = new URL(providerURL, ".well-known/openid-configuration");
        assertEquals("https://login.microsoftonline.com/00000000-1111-2222-3333-444444444444/v2.0/.well-known/openid-configuration",
                wellKnown.toString());
    }

    @Test
    public void rsaKeys() throws Exception {
        // org.keycloak.jose.jwk.JWKParser.createRSAPublicKey
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        KeyPair pair = kpg.generateKeyPair();
        PublicKey publicKey1 = pair.getPublic();
        PrivateKey privateKey = pair.getPrivate();

        KeySpec publicKeySpec = new RSAPublicKeySpec(((RSAPublicKey) publicKey1).getModulus(), ((RSAPublicKey) publicKey1).getPublicExponent());
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PublicKey publicKey2 = kf.generatePublic(publicKeySpec);

        assertEquals(publicKey1, publicKey2);
    }

    @Test
    public void ecKeys() throws Exception {
        // org.keycloak.jose.jwk.JWKParser.createECPublicKey
        // we need BouncyCastle to create EC params. See
        //  - org.keycloak.common.crypto.CryptoProvider.createECParams
        //  - org.bouncycastle.jce.ECNamedCurveTable.getParameterSpec
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        KeyPair pair = kpg.generateKeyPair();
        KeyFactory kf = KeyFactory.getInstance("EC");

        ECKey ecKey = new ECKeyGenerator(Curve.P_521).generate();
        Map<String, Object> jsonObjectForECKey = ecKey.toJSONObject();
        assertEquals("EC", jsonObjectForECKey.get("kty"));

        JWK key = JWK.parse(jsonObjectForECKey);
        assertNotNull(key);
        assertEquals(key.getKeyType(), KeyType.EC);
        PublicKey publicKey1 = key.toECKey().toPublicKey();
        PublicKey publicKey2 = ecKey.toPublicKey();
        assertEquals(publicKey1, publicKey2);
    }

    @Test
    public void keysFromJWKS() throws IOException, ParseException, JOSEException, org.jolokia.json.parser.ParseException {
        JSONObject keys = (JSONObject) new JSONParser().parse(Files.readString(Paths.get("src/test/resources/keys.json")));
        JSONArray array = (JSONArray) keys.get("keys");
        JSONObject key1 = (JSONObject) array.get(0);
        JWK jwk1 = JWK.parse(key1);
        JSONObject key2 = (JSONObject) array.get(1);
        JWK jwk2 = JWK.parse(key2);
        JSONObject key3 = (JSONObject) array.get(2);
        JWK jwk3 = JWK.parse(key3);

        assertEquals(KeyType.RSA, jwk1.getKeyType());
        assertEquals(KeyUse.ENCRYPTION, jwk1.getKeyUse());

        assertEquals(KeyType.RSA, jwk2.getKeyType());
        assertEquals(JWSAlgorithm.RS256, jwk2.getAlgorithm());
        assertEquals(KeyUse.SIGNATURE, jwk2.getKeyUse());
        assertNotNull(jwk2.toRSAKey().toPublicKey());

        assertEquals(KeyType.EC, jwk3.getKeyType());
        assertEquals(JWSAlgorithm.ES384, jwk3.getAlgorithm());
        assertEquals(KeyUse.SIGNATURE, jwk3.getKeyUse());
        assertNotNull(jwk3.toECKey().toPublicKey());
    }

    @Test
    public void emptyConfiguration() throws Exception {
        Properties props = new Properties();
        OidcConfiguration cfg = new OidcConfiguration(null, props);
        assertNull(cfg.getProviderURL());
    }

    @Test
    public void basicConfiguration() throws Exception {
        Properties props = new Properties();
        props.setProperty("provider", "http://localhost:8180");
        props.setProperty("offline", "true");
        OidcConfiguration cfg = new OidcConfiguration(null, props);
        assertNotNull(cfg.getProviderURL());
    }

    @Test
    public void jsonConfiguration() throws Exception {
        Properties props = new Properties();
        props.setProperty("offline", "true");
        props.setProperty("provider", "http://localhost:8180");
        props.setProperty("client_id", "hawtio-server");
        props.setProperty("response_mode", "fragment");
        props.setProperty("scope", "openid email");
        props.setProperty("redirect_uri", "http://localhost:8080");
        props.setProperty("oidc.rolesPath", "resource_access.${client_id}.roles");
        OidcConfiguration cfg = new OidcConfiguration(null, props);
        JSONObject json = (JSONObject) new JSONParser().parse(cfg.toJSON());

        assertEquals("http://localhost:8180", json.get("provider"));
        assertEquals("fragment", json.get("response_mode"));
        assertEquals("openid email", json.get("scope"));
    }

    @Test
    public void jaasOidcConfiguration() throws Exception {
        Properties props = new Properties();
        props.setProperty("provider", "http://localhost:8180");
        props.setProperty("offline", "true");
        props.setProperty("client_id", "some-client");
        props.setProperty("oidc.rolesPath", "resource_access.${client_id}.roles");
        props.setProperty("roleMapping.Hawtio.Admin", "admin");
        OidcConfiguration cfg = new OidcConfiguration(null, props);
        cfg.setUserPrincipalClass(UserPrincipal.class);
        cfg.setRolePrincipalClass(RolePrincipal.class);
        assertNotNull(cfg.getProviderURL());
        assertSame(UserPrincipal.class, cfg.getUserClass());
        assertSame(RolePrincipal.class, cfg.getRoleClass());

        assertNotNull(cfg.getAppConfigurationEntry(null));

        KeyPairGenerator rsa = KeyPairGenerator.getInstance("RSA");
        rsa.initialize(4096);
        KeyPair pair = rsa.generateKeyPair();
        JWSSigner signer = new RSASSASigner(pair.getPrivate());

        RSAKey.Builder keyBuilder = new RSAKey.Builder((RSAPublicKey) pair.getPublic())
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.RS512);

        keyBuilder.keyID("key1");

        RSAKey rsaKey = keyBuilder.build();
        JSONObject keysDefinition = new JSONObject();
        JSONObject key = new JSONObject();
        JSONArray keysArray = new JSONArray(1);
        keysArray.add(0, key);
        keysDefinition.put("keys", keysArray);
        key.put("kid", "key1");
        key.put("kty", KeyType.RSA.toString());
        key.put("alg", JWSAlgorithm.RS512.toString());
        key.put("use", KeyUse.SIGNATURE.toString());
        key.put("n", rsaKey.getModulus().toString());
        key.put("e", rsaKey.getPublicExponent().toString());
        cfg.cachePublicKeys(keysDefinition);

        JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder();
        builder.claim("sub", "admin");
        builder.claim("resource_access", Map.of("some-client", Map.of("roles", new String[] { "Hawtio.Admin" })));
        JWSHeader header = JWSHeader.parse(Map.of("kid", "key1", "alg", JWSAlgorithm.RS512.toString()));
        SignedJWT jwtSigned = new SignedJWT(header, builder.build());
        jwtSigned.sign(signer);

        String accessToken = jwtSigned.serialize();

        JWT jwt = JWTParser.parse(accessToken);

        JWKSecurityContext jwkContext = cfg.getJwkContext();
        DefaultJWTProcessor<JWKSecurityContext> processor = new DefaultJWTProcessor<>();
        processor.setJWSKeySelector(new KidKeySelector());
        DefaultJWTClaimsVerifier<JWKSecurityContext> claimsVerifier = new DefaultJWTClaimsVerifier<>(null, null, Set.of("sub"));
        processor.setJWTClaimsSetVerifier(claimsVerifier);

        processor.process(jwt, jwkContext);

        CallbackHandler handler = callbacks -> {
            for (Callback c : callbacks) {
                if (c instanceof BearerTokenCallback) {
                    ((BearerTokenCallback) c).setToken(accessToken);
                }
            }
        };
        Subject subject = new Subject();
        new LoginContext("hawtio", subject, handler, cfg).login();
        Set<RolePrincipal> principals = subject.getPrincipals(RolePrincipal.class);
        assertEquals(1, principals.size());
        assertEquals("admin", principals.iterator().next().getName());
    }

    @Test
    @Disabled("Manual test")
    public void customSSLContextForPublicSite() throws IOException, NoSuchAlgorithmException, KeyManagementException, CertificateException, KeyStoreException {
        // can we create custom SSLContext for HttpClient4 with own trust material, but which
        // can connect to a site with known certificate ($JAVA_HOME/lib/security/cacerts)?

        RequestConfig.Builder requestConfigBuilder = RequestConfig.custom();
        // timeout in milliseconds used when requesting a connection from the connection manager
        requestConfigBuilder.setConnectionRequestTimeout(1);
        // java.net.Socket.setSoTimeout(), java.net.Socket.connect(..., timeout)
        requestConfigBuilder.setConnectTimeout(5000);
        // java.net.Socket.setSoTimeout()
        requestConfigBuilder.setSocketTimeout(10000);

        SocketConfig.Builder socketConfigBuilder = SocketConfig.custom();
        // java.net.Socket.setSoTimeout()
        socketConfigBuilder.setSoTimeout(10000);
        ConnectionConfig.Builder connectionConfigBuilder = ConnectionConfig.custom();

        SSLContextBuilder sslContextBuilder = SSLContexts.custom();
        Properties props = new Properties();
        props.setProperty("hawtio.truststore", "target/test-classes/hawtio.jks");

        // Loads default $JAVA_HOME/lib/security/cacerts
        sslContextBuilder.loadTrustMaterial((TrustStrategy) null);
        // Loads custom truststore - without default TMF, we wouldn't be able to connect to sites with certificates
        // provided by JDK itself
        sslContextBuilder.loadTrustMaterial(new File(Strings.resolvePlaceholders("${hawtio.truststore}", props)),
                "hawtio".toCharArray());
//        sslContextBuilder.loadKeyMaterial((File) null, null, null);

        SSLConnectionSocketFactory csf = new SSLConnectionSocketFactory(sslContextBuilder.build(), new DefaultHostnameVerifier());

        Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.getSocketFactory())
                .register("https", csf)
                .build();

        PoolingHttpClientConnectionManager connectionManager
                = new PoolingHttpClientConnectionManager(registry, null, null, null, -1L, TimeUnit.MILLISECONDS);
        connectionManager.setDefaultConnectionConfig(connectionConfigBuilder.build());
        connectionManager.setDefaultSocketConfig(socketConfigBuilder.build());
        connectionManager.setMaxTotal(20);
        connectionManager.setDefaultMaxPerRoute(connectionManager.getMaxTotal());

        HttpClientBuilder builder = HttpClients.custom();
        builder.setDefaultCookieStore(new NopCookieStore());
        builder.useSystemProperties();
        builder.setSSLSocketFactory(csf);
        builder.setConnectionManager(connectionManager);
        builder.setDefaultRequestConfig(requestConfigBuilder.build());
//        builder.setProxy(null);

        try (CloseableHttpClient client = builder.build()) {
            HttpGet get = new HttpGet("https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration");
            CloseableHttpResponse res = client.execute(get);
            LOG.info("Result: {}", res.getStatusLine());
            LOG.info("Content-Type: {}", res.getFirstHeader("Content-Type"));
        }
    }

}
