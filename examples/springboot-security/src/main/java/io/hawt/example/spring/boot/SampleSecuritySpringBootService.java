package io.hawt.example.spring.boot;

import io.hawt.config.ConfigFacade;
import io.hawt.springboot.HawtioPlugin;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleSecuritySpringBootService {

    public static void main(String[] args) {
        SpringApplication.run(SampleSecuritySpringBootService.class, args);
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
     * Set things up to be in offline mode.
     */
    @Bean
    public ConfigFacade configFacade() {
        return ConfigFacade.getSingleton();
    }
}
