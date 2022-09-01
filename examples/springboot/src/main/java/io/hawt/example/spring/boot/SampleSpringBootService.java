package io.hawt.example.spring.boot;

import io.hawt.config.ConfigFacade;
import io.hawt.springboot.HawtioPlugin;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.trace.http.HttpTraceRepository;
import org.springframework.boot.actuate.trace.http.InMemoryHttpTraceRepository;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleSpringBootService {

    public static void main(String[] args) {
        SpringApplication.run(SampleSpringBootService.class, args);
    }

    /**
     * Loading an example plugin.
     */
    @Bean
    public HawtioPlugin samplePlugin() {
        return new HawtioPlugin("sample-plugin",
            "plugins",
            "",
            new String[] { "sample-plugin/sample-plugin.js" });
    }

    /**
     * Set things up to be in offline mode.
     */
    @Bean
    public ConfigFacade configFacade() {
        return ConfigFacade.getSingleton();
    }

    /**
     * Enable HTTP tracing for Spring Boot
     */
    @Bean
    public HttpTraceRepository httpTraceRepository() {
        return new InMemoryHttpTraceRepository();
    }
}
