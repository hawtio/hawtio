package io.hawt.sample.spring.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

@EnableAutoConfiguration
public class SampleSpringBootService {

    public static void main(String[] args) {
        new SpringApplication(SampleSpringBootService.class).run();
    }

}
