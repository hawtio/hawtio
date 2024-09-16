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
package io.hawt.web.auth.oidc.token;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Date;
import java.util.Set;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.proc.JWKSecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.jolokia.json.JSONArray;
import org.jolokia.json.JSONObject;
import org.jolokia.json.parser.JSONParser;
import org.junit.jupiter.api.Test;

public class TokenTest {

    @Test
    public void parseToken() throws Exception {
        String token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ2eVg1UFMzM2lWb2RFNWI4ak9PTS1Ra1MxWnVUaVAxNGRwV2E2QlliSTRBIn0.eyJleHAiOjE3MDg5MzI0OTgsImlhdCI6MTcwODkzMjE5OCwiYXV0aF90aW1lIjoxNzA4OTMyMTk2LCJqdGkiOiJhZmIxMTNlNC1iOTAwLTQ2MzctYjJiNC04YjM5OTNiNzc2YTkiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgxODAvcmVhbG1zL2hhd3RpbyIsImF1ZCI6WyJoYXd0aW8tY29uZmlkZW50aWFsIiwiYWNjb3VudCJdLCJzdWIiOiJmY2MzYmRhMy0xNjcyLTRjMjUtYjU3Zi0zMzY4YjI2Y2FhYWQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJoYXd0aW8tcHVibGljIiwibm9uY2UiOiI4YmZiOWFkYy0yNzhmLTQ0N2MtODA4Mi02NTUwYWE2MTViMzQiLCJzZXNzaW9uX3N0YXRlIjoiZWFjOWExM2YtZTQyZi00OTg2LTk2YzAtZTlkNjFjNGI2NDg5IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWhhd3RpbyJdfSwicmVzb3VyY2VfYWNjZXNzIjp7Imhhd3Rpby1wdWJsaWMiOnsicm9sZXMiOlsiaGF3dGlvLXZpZXdlciIsImhhd3Rpby1hZG1pbiIsImFkbWluIl19LCJoYXd0aW8tY29uZmlkZW50aWFsIjp7InJvbGVzIjpbImhhd3Rpby12aWV3ZXIiLCJhZG1pbiIsImhhd3Rpby1hZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImVhYzlhMTNmLWU0MmYtNDk4Ni05NmMwLWU5ZDYxYzRiNjQ4OSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJoYXd0aW8ifQ.Tzc0YZPVFw548T1KrppaISDy33EKGkvLNtjwLEA_K2y4GjK7d0uS7BpCtwmWMR_rX4GS7z4ondxFhqgcIUb4rQVEDDK3iVsp5vfx6A8OojBdHSchI9mUJRHmaDBCnmCNLvm31_ZF457PeNUgGiYDHiMSvHzKiSseKR7SZQKixKch2aF9d-QLV-Pzuhl8LkQNtDMyocjhWdI-EZYr8NnKNI53gcohfskjArzDFlRuMkRkGwflStHypijIGU5YZnPEGkmVsFhHRhWPLOsb9lTmbWNRSiiQ3GlEafVvvehUh2FBjEv1lcBTmOFhhPbtsl0df4nkn6mskajavF7AAiBj5A";
        JSONObject keys = (JSONObject) new JSONParser().parse(Files.readString(Paths.get("src/test/resources/keys.json")));
        JSONArray array = (JSONArray) keys.get("keys");
        JSONObject key1 = (JSONObject) array.get(0);
        JWK jwk1 = JWK.parse(key1);
        JSONObject key2 = (JSONObject) array.get(1);
        JWK jwk2 = JWK.parse(key2);
        JSONObject key3 = (JSONObject) array.get(2);
        JWK jwk3 = JWK.parse(key3);

        JWKSecurityContext context = new JWKSecurityContext(Arrays.asList(jwk2, jwk3));
        DefaultJWTProcessor<JWKSecurityContext> processor = new DefaultJWTProcessor<>();
        processor.setJWSKeySelector(new KidKeySelector());
        DefaultJWTClaimsVerifier<JWKSecurityContext> claimsVerifier = new DefaultJWTClaimsVerifier<>("hawtio-confidential", null, Set.of("sub")) {
            @Override
            protected Date currentTime() {
                return new Date(1708932199000L);
            }
        };
        processor.setJWTClaimsSetVerifier(claimsVerifier);
        JWTClaimsSet claimsSet = processor.process(token, context);
    }

}
