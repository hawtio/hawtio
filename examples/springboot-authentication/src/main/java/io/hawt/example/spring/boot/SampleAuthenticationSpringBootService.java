package io.hawt.example.spring.boot;

import java.util.Optional;
import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_AUTHENTICATION_ENABLED;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_REALM;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_ROLES;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_ROLE_PRINCIPAL_CLASSES;

@SpringBootApplication
public class SampleAuthenticationSpringBootService {

    private static final Logger LOG = LoggerFactory.getLogger(SampleAuthenticationSpringBootService.class);
    private static final String JAVA_SECURITY_AUTH_LOGIN_CONFIG = "java.security.auth.login.config";

    public static void main(String[] args) {
        SpringApplication.run(SampleAuthenticationSpringBootService.class, args);
    }

    /**
     * Configure authentication.
     */
    @PostConstruct
    public void init() {
        Optional.ofNullable(this.getClass().getClassLoader().getResource("login.conf"))
            .ifPresent(loginResource -> setSystemPropertyIfNotSet(JAVA_SECURITY_AUTH_LOGIN_CONFIG, loginResource.toExternalForm()));
        LOG.info("Using loginResource {} : {}", JAVA_SECURITY_AUTH_LOGIN_CONFIG, System.getProperty(JAVA_SECURITY_AUTH_LOGIN_CONFIG));

        Optional.ofNullable(this.getClass().getClassLoader().getResource("realm.properties"))
            .ifPresent(loginFile -> setSystemPropertyIfNotSet("login.file", loginFile.toExternalForm()));
        LOG.info("Using login.file : {}", System.getProperty("login.file"));

        setSystemPropertyIfNotSet(HAWTIO_ROLES, "admin");
        setSystemPropertyIfNotSet(HAWTIO_REALM, "hawtio");
        setSystemPropertyIfNotSet(HAWTIO_ROLE_PRINCIPAL_CLASSES, "org.eclipse.jetty.jaas.JAASRole");

        System.setProperty(HAWTIO_AUTHENTICATION_ENABLED, Boolean.getBoolean("debugMode") ? "false" : "true");
    }

    private void setSystemPropertyIfNotSet(final String key, final String value) {
        if (System.getProperty(key) == null) {
            System.setProperty(key, value);
        }
    }

}
