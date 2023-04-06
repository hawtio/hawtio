package io.hawt.example.spring.boot;

import io.hawt.config.ConfigFacade;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleSecuritySpringBootService {

    public static void main(String[] args) {
        SpringApplication.run(SampleSecuritySpringBootService.class, args);
    }

    /**
     * Set things up to be in offline mode.
     */
    @Bean
    public ConfigFacade configFacade() {
        return ConfigFacade.getSingleton();
    }
}
