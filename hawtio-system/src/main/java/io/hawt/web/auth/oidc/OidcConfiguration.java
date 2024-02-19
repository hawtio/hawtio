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

import java.net.URL;

import io.hawt.util.Strings;
import org.json.JSONObject;

/**
 * Configuration of OpenID Connect.
 */
public class OidcConfiguration {

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

    public URL getProviderURL() {
        return providerURL;
    }

    public void setProviderURL(URL providerURL) {
        this.providerURL = providerURL;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public ResponseMode getResponseMode() {
        return responseMode;
    }

    public void setResponseMode(ResponseMode responseMode) {
        this.responseMode = responseMode;
    }

    public String[] getScopes() {
        return scopes;
    }

    public void setScopes(String[] scopes) {
        this.scopes = scopes;
    }

    public URL getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(URL redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getCodeChallengeMethod() {
        return codeChallengeMethod;
    }

    public void setCodeChallengeMethod(String codeChallengeMethod) {
        this.codeChallengeMethod = codeChallengeMethod;
    }

    public PromptType getPrompt() {
        return prompt;
    }

    public void setPrompt(PromptType prompt) {
        this.prompt = prompt;
    }

    /**
     * Serialize to be returned by auth endpoint for client-side HawtIO.
     * @return
     */
    public String toJSON() {
        return this.json;
    }

    public void buildJSON() {
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

        this.json = json.toString();
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
