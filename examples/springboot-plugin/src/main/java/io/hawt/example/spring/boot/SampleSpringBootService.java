package io.hawt.example.spring.boot;

import io.hawt.springboot.HawtioPlugin;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleSpringBootService {

    public static void main(String[] args) {
        SpringApplication.run(SampleSpringBootService.class, args);
    }

    /**
     * Loading a sample plugin.
     */
    @Bean
    public HawtioPlugin samplePlugin() {
        // Need to point to the same port as Hawtio management context, as otherwise
        // it would violate HTTP header policy and not load the script.
        return new HawtioPlugin(
            "http://localhost:10001",
            "samplePlugin",
            "./plugin");
    }
}
