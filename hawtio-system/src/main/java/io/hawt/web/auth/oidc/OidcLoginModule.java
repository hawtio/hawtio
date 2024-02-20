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
import java.util.Map;
import javax.security.auth.Subject;
import javax.security.auth.callback.Callback;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.callback.NameCallback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.LoginException;
import javax.security.auth.spi.LoginModule;

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

    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState, Map<String, ?> options) {
        this.subject = subject;
        this.callbackHandler = callbackHandler;

        this.oidcConfiguration = (OidcConfiguration) options.get(OIDC_JAAS_CONFIGURATION);
    }

    @Override
    public boolean login() throws LoginException {
        Callback[] callbacks = new Callback[2];
        callbacks[0] = new NameCallback("username");
        callbacks[1] = new PasswordCallback("password", false);

        try {
            callbackHandler.handle(callbacks);
            String username = ((NameCallback) callbacks[0]).getName();
            char[] tmpPassword = ((PasswordCallback) callbacks[1]).getPassword();
            String password = new String(tmpPassword);
            ((PasswordCallback) callbacks[1]).clearPassword();

            // we're interested only in the token, which is passed as base64(JWT)
            ValidAccessToken token = validateToken(password);

            return true;
        } catch (IOException e) {
            LoginException loginException = new LoginException(e.getMessage());
            loginException.initCause(e);
            throw loginException;
        } catch (UnsupportedCallbackException e) {
            LOG.error("JAAS configuration error {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean commit() throws LoginException {
        // populate the subject with roles extracted from access_token (if any)
        return true;
    }

    @Override
    public boolean abort() {
        return true;
    }

    @Override
    public boolean logout() throws LoginException {
        // clear OIDC principals from the subject
        return true;
    }

    /**
     * Parse base64 representation of access_token and perform necessary (soon: configurable) validation
     * @param token
     * @return
     */
    private ValidAccessToken validateToken(String token) {
        // for now the validations are inspired by org.keycloak.adapters.rotation.AdapterTokenVerifier.createVerifier():
        //  - existence of "sub" claim
        //  - "typ" == "bearer"
        //  - date between "nbf" and "exp"
        //  - "iss" is what we've configured, but for now I see Entra tokens with "iss": "https://sts.windows.net/<guid>/"
        //  - "aud" should be our client

        return new ValidAccessToken();
    }

}
