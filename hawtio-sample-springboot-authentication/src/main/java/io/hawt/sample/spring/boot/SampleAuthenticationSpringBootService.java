package io.hawt.sample.spring.boot;

import java.net.URL;

import io.hawt.config.ConfigFacade;
import io.hawt.springboot.HawtPlugin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static io.hawt.web.AuthenticationFilter.HAWTIO_AUTHENTICATION_ENABLED;
import static io.hawt.web.AuthenticationFilter.HAWTIO_REALM;
import static io.hawt.web.AuthenticationFilter.HAWTIO_ROLES;
import static io.hawt.web.AuthenticationFilter.HAWTIO_ROLE_PRINCIPAL_CLASSES;

@SpringBootApplication
public class SampleAuthenticationSpringBootService {

    private static final Logger LOG = LoggerFactory.getLogger(SampleAuthenticationSpringBootService.class);
    private static final String JAVA_SECURITY_AUTH_LOGIN_CONFIG = "java.security.auth.login.config";

    public static void main(String[] args) {
        System.setProperty(HAWTIO_AUTHENTICATION_ENABLED, "false");
        SpringApplication.run(SampleAuthenticationSpringBootService.class, args);
    }

    /**
     * Loading an example plugin.
     */
    @Bean
    public HawtPlugin samplePlugin() {
        return new HawtPlugin("sample-plugin", "/hawtio/plugins", "", new String[] { "sample-plugin/js/sample-plugin.js" });
    }

    /**
     * Configure facade to use authentication.
     *
     * @return config
     * @throws Exception if an error occurs
     */
    @Bean(initMethod = "init")
    public ConfigFacade configFacade() throws Exception {

        final URL loginResource = this.getClass().getClassLoader().getResource("login.conf");
        if (loginResource != null) {
            setSystemPropertyIfNotSet(JAVA_SECURITY_AUTH_LOGIN_CONFIG, loginResource.getFile());
        }
        LOG.info("Using loginResource " + JAVA_SECURITY_AUTH_LOGIN_CONFIG + " : " + System
            .getProperty(JAVA_SECURITY_AUTH_LOGIN_CONFIG));

        final URL loginFile = this.getClass().getClassLoader().getResource("realm.properties");
        if (loginFile != null) {
            setSystemPropertyIfNotSet("login.file", loginFile.getFile());
        }
        LOG.info("Using login.file : " + System.getProperty("login.file"));

        setSystemPropertyIfNotSet(HAWTIO_ROLES, "admin");
        setSystemPropertyIfNotSet(HAWTIO_REALM, "hawtio");
        setSystemPropertyIfNotSet(HAWTIO_ROLE_PRINCIPAL_CLASSES, "org.eclipse.jetty.jaas.JAASRole");
        if (!Boolean.getBoolean("debugMode")) {
            System.setProperty(HAWTIO_AUTHENTICATION_ENABLED, "true");
        }
        return new ConfigFacade();
    }

    private void setSystemPropertyIfNotSet(final String key, final String value) {
        if (System.getProperty(key) == null) {
            System.setProperty(key, value);
        }
    }

}
