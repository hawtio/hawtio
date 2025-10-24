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

import java.util.Collections;
import java.util.Map;
import javax.security.auth.login.AppConfigurationEntry;
import javax.security.auth.login.Configuration;

import io.hawt.web.auth.AuthenticationConfiguration;

/**
 * <p>JAAS {@link Configuration} that integrates with Spring Security. It includes two
 * {@link javax.security.auth.spi.LoginModule login modules} with particular responsibilities:<ol>
 *     <li>Spring Security {@code SecurityContextLoginModule} which turns existing (required)
 *     {@code org.springframework.security.core.Authentication} object into JAAS {@link java.security.Principal}
 *     and sets it as the only principal of JAAS {@link javax.security.auth.Subject}</li>
 *     <li>Hawtio {@code HawtioSpringSecurityLoginModule} which examines already authenticated
 *     {@link javax.security.auth.Subject} and extracts granted roles in Spring Security {@code Authentication}
 *     and sets them as additional principals of the subject. The role class is taken from first available
 *     class of {@code rolePrincipalClasses} Hawtio property.</li>
 * </ol></p>
 *
 * <p>This configuration will only be used if Spring Security is properly configured and
 * {@code hawtio-springboot-security} is available on the classpath.</p>
 */
public class SpringSecurityJAASConfiguration extends Configuration {

    private static final String SPRING_SECURITY_LOGIN_MODULE
            = "org.springframework.security.authentication.jaas.SecurityContextLoginModule";
    private static final String HAWTIO_SPRING_SECURITY_LOGIN_MODULE
            = "io.hawt.springboot.security.HawtioSpringSecurityLoginModule";

    private final AuthenticationConfiguration authConfig;

    public SpringSecurityJAASConfiguration(AuthenticationConfiguration authConfig) {
        this.authConfig = authConfig;
    }

    @Override
    public AppConfigurationEntry[] getAppConfigurationEntry(String name) {
        return new AppConfigurationEntry[] {
                new AppConfigurationEntry(SPRING_SECURITY_LOGIN_MODULE,
                        // for multi-authentication, SUFFICIENT is preferred
                        // but because someone configures Spring Security, it means (s)he
                        // is aware what is going on, this we use REQUIRED
                        // also, SUFFICIENT will skip commit() method of the next module which is required
                        // to augment the principals created by Spring Security...
                        AppConfigurationEntry.LoginModuleControlFlag.REQUIRED,
                        Collections.emptyMap()),
                new AppConfigurationEntry(HAWTIO_SPRING_SECURITY_LOGIN_MODULE,
                        // OPTIONAL, because this login module only alters subject's roles if Spring Security
                        // added proper principal
                        AppConfigurationEntry.LoginModuleControlFlag.OPTIONAL,
                        // yes - this is how it's done with JAAS. With default configuration
                        // (-Djava.security.auth.login.config) we can pass only String values, but programmatically
                        // we have more flexibility
                        Map.of(AuthenticationConfiguration.class.getName(), authConfig))
        };
    }

}
