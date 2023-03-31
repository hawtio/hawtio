package io.hawt.example.spring.boot;

import java.net.URL;

import io.hawt.config.ConfigFacade;
import io.hawt.springboot.HawtioPlugin;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleAuthenticationSpringBootService {

    private static final Logger LOG = LoggerFactory.getLogger(SampleAuthenticationSpringBootService.class);
    private static final String JAVA_SECURITY_AUTH_LOGIN_CONFIG = "java.security.auth.login.config";

    public static void main(String[] args) {
        System.setProperty(AuthenticationConfiguration.HAWTIO_AUTHENTICATION_ENABLED, "false");
        SpringApplication.run(SampleAuthenticationSpringBootService.class, args);
    }

    /**
     * Loading an example plugin.
     */
    @Bean
    public HawtioPlugin samplePlugin() {
        // Need to point to the same port as Hawtio management context, as otherwise
        // it would violate Content Security Policy HTTP header policy and thus not
        // load the script.
        return new HawtioPlugin(
            "http://localhost:10001",
            "samplePlugin",
            "./plugin");
    }

    /**
     * Configure facade to use authentication.
     *
     * @return config
     */
    @Bean(initMethod = "init")
    public ConfigFacade configFacade() {

        final URL loginResource = this.getClass().getClassLoader().getResource("login.conf");
        if (loginResource != null) {
            setSystemPropertyIfNotSet(JAVA_SECURITY_AUTH_LOGIN_CONFIG, loginResource.toExternalForm());
        }
        LOG.info("Using loginResource " + JAVA_SECURITY_AUTH_LOGIN_CONFIG + " : " + System
            .getProperty(JAVA_SECURITY_AUTH_LOGIN_CONFIG));

        final URL loginFile = this.getClass().getClassLoader().getResource("realm.properties");
        if (loginFile != null) {
            setSystemPropertyIfNotSet("login.file", loginFile.toExternalForm());
        }
        LOG.info("Using login.file : " + System.getProperty("login.file"));

        setSystemPropertyIfNotSet(AuthenticationConfiguration.HAWTIO_ROLES, "admin");
        setSystemPropertyIfNotSet(AuthenticationConfiguration.HAWTIO_REALM, "hawtio");
        setSystemPropertyIfNotSet(AuthenticationConfiguration.HAWTIO_ROLE_PRINCIPAL_CLASSES, "org.eclipse.jetty.jaas.JAASRole");
        if (!Boolean.getBoolean("debugMode")) {
            System.setProperty(AuthenticationConfiguration.HAWTIO_AUTHENTICATION_ENABLED, "true");
        }
        return new ConfigFacade();
    }

    private void setSystemPropertyIfNotSet(final String key, final String value) {
        if (System.getProperty(key) == null) {
            System.setProperty(key, value);
        }
    }

}
