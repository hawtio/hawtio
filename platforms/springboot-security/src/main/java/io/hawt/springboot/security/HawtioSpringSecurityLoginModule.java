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
package io.hawt.springboot.security;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.security.Principal;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import javax.security.auth.Subject;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.spi.LoginModule;

import io.hawt.web.auth.AuthenticationConfiguration;
import io.hawt.web.auth.RolePrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

/**
 * This {@link LoginModule} should be configured after
 * {@link org.springframework.security.authentication.jaas.SecurityContextLoginModule} to tweak the {@link Subject}
 * a bit by extracting roles from {@link Authentication} as separate role {@link Principal principals}.
 */
public class HawtioSpringSecurityLoginModule implements LoginModule {

    public static final Logger LOG = LoggerFactory.getLogger(HawtioSpringSecurityLoginModule.class);

    private Subject subject;
    private Class<? extends Principal> roleClass;

    @Override
    public void initialize(Subject subject, CallbackHandler callbackHandler, Map<String, ?> sharedState, Map<String, ?> options) {
        this.subject = subject;
        AuthenticationConfiguration authConfig = (AuthenticationConfiguration) options.get(AuthenticationConfiguration.class.getName());
        if (authConfig != null) {
            roleClass = authConfig.getDefaultRolePrincipalClass();
        }

        if (roleClass == null) {
            roleClass = RolePrincipal.class;
        }
    }

    @Override
    public boolean login() {
        return true;
    }

    @Override
    public boolean commit() {
        // see org.springframework.security.core.userdetails.User.UserBuilder.roles()
        // where "role" is something like "admin", "viewer", ..., while
        // "authority" is a role name prefixed with "ROLE_"
        Set<Principal> principals = new LinkedHashSet<>(this.subject.getPrincipals());
        for (Principal principal : principals) {
            if (principal instanceof Authentication auth) {
                // convert all GrantedAuthorities of single Spring Security principal into
                // separate role principals specific for Hawtio
                for (GrantedAuthority ga : auth.getAuthorities()) {
                    String role = ga.getAuthority();
                    if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }
                    Constructor<? extends Principal> ctor;
                    try {
                        ctor = roleClass.getConstructor(String.class);
                        subject.getPrincipals().add(ctor.newInstance(role));
                    } catch (NoSuchMethodException | InstantiationException | IllegalAccessException |
                             InvocationTargetException e) {
                        LOG.warn("Problem creating principal instance of class {} for role {}",
                                roleClass, role, e);
                    }
                }
            }
        }

        return true;
    }

    @Override
    public boolean abort() {
        return false;
    }

    @Override
    public boolean logout() {
        return subject.getPrincipals().removeIf(principal -> principal.getClass() == roleClass);
    }

}
