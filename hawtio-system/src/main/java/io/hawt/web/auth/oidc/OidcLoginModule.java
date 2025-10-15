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

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.security.Principal;
import java.text.ParseException;
import java.util.Map;
import java.util.Set;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWKSecurityContext;
import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTParser;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import io.hawt.web.auth.RolePrincipal;
import io.hawt.web.auth.oidc.token.BearerTokenCallback;
import io.hawt.web.auth.oidc.token.KidKeySelector;
import io.hawt.web.auth.oidc.token.ValidAccessToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static io.hawt.web.auth.oidc.OidcConfiguration.OIDC_JAAS_CONFIGURATION;

/**
 * <p>This login module operates on {@code Bearer} token which contains OAuth2 Access Token. Roles are taken from the
 * token depending on the <em>flavor</em> of OpenID Connect / OAuth2 used.</p>
 *
 * <p>For example, Keycloak encodes roles differently depending on {@code use-resource-role-mappings}:<ul>
 *     <li>{@code use-resource-role-mappings = true}: roles come from {@code resource_access.<client-id>.roles}</li>
 *     <li>{@code use-resource-role-mappings = false}: roles come from {@code realm_access.roles}</li>
 * </ul>
 * In Azure/Entra ID we expect roles to be directly encoded in {@code roles} claim of the access token.</p>
 */
public class OidcLoginModule implements LoginModule {

    public static final Logger LOG = LoggerFactory.getLogger(OidcLoginModule.class);

    private Subject subject;
    private CallbackHandler callbackHandler;
    private OidcConfiguration oidcConfiguration;

    private ValidAccessToken parsedToken;

    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState, Map<String, ?> options) {
        this.subject = subject;
        this.callbackHandler = callbackHandler;

        this.oidcConfiguration = (OidcConfiguration) options.get(OIDC_JAAS_CONFIGURATION);
    }

    @Override
    public boolean login() throws LoginException {
        Callback[] callbacks = new Callback[1];
        callbacks[0] = new BearerTokenCallback();

        try {
            callbackHandler.handle(callbacks);
            String tokenValue = ((BearerTokenCallback) callbacks[0]).getToken();
            if (tokenValue == null) {
                return false;
            }

            // we're interested only in the token, which is passed as base64(JWT)
            // token is validated and container information is stored until commit(), where
            // javax.security.auth.Subject is populated with principals and credentials
            ValidAccessToken token = validateToken(tokenValue);

            if (token == null) {
                return false;
            } else {
                this.parsedToken = token;
                // roles/groups/subject will be extracted in commit()
                return true;
            }
        } catch (IOException e) {
            LoginException loginException = new LoginException(e.getMessage());
            loginException.initCause(e);
            throw loginException;
        } catch (UnsupportedCallbackException e) {
            LOG.error("JAAS configuration error {}", e.getMessage(), e);
            return false;
        } catch (ParseException e) {
            LOG.error("JWT parse exception: {}", e.getMessage());
            LoginException loginException = new LoginException(e.getMessage());
            loginException.initCause(e);
            throw loginException;
        }
    }

    @Override
    public boolean commit() {
        if (parsedToken == null) {
            return false;
        }

        // populate the subject with roles extracted from access_token (if any)
        Class<?> clz = oidcConfiguration.getRoleClass();
        try {
            String[] roles = oidcConfiguration.extractRoles(parsedToken);
            for (String role : roles) {
                Constructor<?> ctr = clz.getConstructor(String.class);
                this.subject.getPrincipals().add((Principal) ctr.newInstance(role));
            }
            this.subject.getPrivateCredentials().add(parsedToken.getAccessToken());
            return true;
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            LOG.warn("Problem instantiating role principal for class {}", clz);
        }

        return false;
    }

    @Override
    public boolean abort() {
        if (parsedToken != null) {
            parsedToken = null;
            return true;
        }
        return false;
    }

    @Override
    public boolean logout() throws LoginException {
        // clear OIDC principals from the subject
        if (subject != null) {
            subject.getPrivateCredentials().clear();

            subject.getPrincipals().removeIf(p ->
                    oidcConfiguration.getRoleClass().isAssignableFrom(p.getClass()) || RolePrincipal.class == p.getClass());
            return true;
        }
        return false;
    }

    /**
     * Parse base64 representation of access_token and perform necessary (soon: configurable) validation
     * @param token
     * @return
     */
    private ValidAccessToken validateToken(String token) throws ParseException {
        // see also:
        //  - org.springframework.security.oauth2.client.oidc.authentication.OidcIdTokenValidator#validate()
        //  - org.keycloak.adapters.rotation.AdapterTokenVerifier.createVerifier()

        // for now the validations are inspired by org.keycloak.adapters.rotation.AdapterTokenVerifier.createVerifier():
        //  - existence of "sub" claim
        //  - "typ" == "bearer"
        //  - date between "nbf" and "exp"
        //  - "iss" is what we've configured, but for now I see Entra tokens with "iss": "https://sts.windows.net/<guid>/"
        //  - "aud" should be our client
        try {
            JWT jwt = JWTParser.parse(token);

            oidcConfiguration.refreshPublicKeysIfNeeded();
            // context built on available signature public keys
            JWKSecurityContext jwkContext = oidcConfiguration.getJwkContext();
            if (jwkContext == null) {
                return null;
            }
            DefaultJWTProcessor<JWKSecurityContext> processor = new DefaultJWTProcessor<>();
            processor.setJWSKeySelector(new KidKeySelector());
            DefaultJWTClaimsVerifier<JWKSecurityContext> claimsVerifier = new DefaultJWTClaimsVerifier<>(null, null, Set.of("sub"));
            processor.setJWTClaimsSetVerifier(claimsVerifier);

            processor.process(jwt, jwkContext);

            return new ValidAccessToken(jwt, token);
        } catch (ParseException e) {
            LOG.error("JWT parsing error", e);
        } catch (BadJOSEException | JOSEException e) {
            LOG.error("JWT processing error: {}", e.getMessage());
        }

        return null;
    }

}
