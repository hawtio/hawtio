package io.hawt.example.spring.boot;

import io.hawt.config.ConfigFacade;
import io.hawt.springboot.HawtPlugin;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SampleSpringBootService extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(SampleSpringBootService.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(SampleSpringBootService.class);
    }

    /**
     * Loading an example plugin.
     */
    @Bean
    public HawtPlugin samplePlugin() {
        return new HawtPlugin("sample-plugin",
            "plugins",
            "",
            new String[] { "sample-plugin/js/sample-plugin.js" });
    }

    /**
     * Set things up to be in offline mode.
     */
    @Bean
    public ConfigFacade configFacade() {
        return ConfigFacade.getSingleton();
    }
}
