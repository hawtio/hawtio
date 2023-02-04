/*
 *  Copyright 2017 Red Hat, Inc.
 *
 *  Red Hat licenses this file to you under the Apache License, version
 *  2.0 (the "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *  implied.  See the License for the specific language governing
 *  permissions and limitations under the License.
 */
package io.hawt.system;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import javax.security.auth.Subject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helpers for authentication and authorization.
 */
public class AuthHelpers {

    private static final Logger LOG = LoggerFactory.getLogger(AuthHelpers.class);

    public static final List<String> KNOWN_PRINCIPALS = Arrays.asList(
        "UserPrincipal", "KeycloakPrincipal", "JAASPrincipal", "SimplePrincipal");

    public static String getUsername(Subject subject) {
        Set<Principal> principals = subject.getPrincipals();

        String username = null;

        if (principals != null) {
            for (Principal principal : principals) {
                String principalClass = principal.getClass().getSimpleName();
                if (KNOWN_PRINCIPALS.contains(principalClass)) {
                    username = principal.getName();
                    LOG.debug("Username in principal: {}", username);
                }
            }
        }

        return username;
    }

}
