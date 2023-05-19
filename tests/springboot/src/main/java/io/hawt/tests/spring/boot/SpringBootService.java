package io.hawt.tests.spring.boot;

import java.util.Optional;

import javax.annotation.PostConstruct;

import io.hawt.springboot.HawtioPlugin;
import io.hawt.web.auth.AuthenticationConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_AUTHENTICATION_ENABLED;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_REALM;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_ROLES;
import static io.hawt.web.auth.AuthenticationConfiguration.HAWTIO_ROLE_PRINCIPAL_CLASSES;

@SpringBootApplication()
public class SpringBootService {
    private static final Logger LOG = LoggerFactory.getLogger(SpringBootService.class);
    private static final String JAVA_SECURITY_AUTH_LOGIN_CONFIG = "java.security.auth.login.config";

    public static void main(String[] args) {
        System.setProperty("hawtio.proxyWhitelist", "localhost, 127.0.0.1");
        System.setProperty(AuthenticationConfiguration.HAWTIO_AUTHENTICATION_ENABLED, "false");
        SpringApplication.run(SpringBootService.class, args);
    }

    /**
     * Loading a sample plugin.
     */
    @Bean
    public HawtioPlugin samplePlugin() {
        /*
         * These are the parameters required to load a remote Hawtio plugin (a.k.a. Module Federation remote module):
         *
         * - url: The URL of the remote entry for the plugin. This must be the same location as the Hawtio console.
         * - scope: The name of the container defined at Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
         * - module: The path exposed from Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
         */
        HawtioPlugin plugin = new HawtioPlugin(
            "http://localhost:10001",
            "samplePlugin",
            "./plugin");

        /*
         * By default, Hawtio expects "plugin" as the name of the Hawtio plugin entry function.
         * If you want to use the name other than the default one, specify the name using HawtioPlugin#setPluginEntry()
         * as follows. See also: sample-plugin/src/sample-plugin/index.ts
         */
        //plugin.setPluginEntry("registerMyPlugin");

        return plugin;
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
