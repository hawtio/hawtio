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

import java.security.Key;
import java.util.Collections;
import java.util.List;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.proc.JWKSecurityContext;
import com.nimbusds.jose.proc.JWSKeySelector;

public class KidKeySelector implements JWSKeySelector<JWKSecurityContext> {

    @Override
    public List<? extends Key> selectJWSKeys(JWSHeader header, JWKSecurityContext ctx) {
        for (JWK key : ctx.getKeys()) {
            if (key.getKeyUse() != KeyUse.SIGNATURE) {
                continue;
            }
            if (key.getKeyID().equals(header.getKeyID())) {
                if (JWSAlgorithm.Family.RSA.contains(header.getAlgorithm())) {
                    try {
                        return Collections.singletonList(key.toRSAKey().toPublicKey());
                    } catch (JOSEException ignored) {
                    }
                }
                if (JWSAlgorithm.Family.EC.contains(header.getAlgorithm())) {
                    try {
                        return Collections.singletonList(key.toECKey().toPublicKey());
                    } catch (JOSEException ignored) {
                    }
                }
            }
        }

        return Collections.emptyList();
    }

}
