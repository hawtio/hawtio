package io.hawt.example.spring.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.web.exchanges.HttpExchangeRepository;
import org.springframework.boot.actuate.web.exchanges.InMemoryHttpExchangeRepository;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class SampleSpringBootService {

    public static void main(String[] args) {
       ConfigurableApplicationContext context =  SpringApplication.run(SampleSpringBootService.class, args);
       Arrays.stream(context.getBeanDefinitionNames()).forEach(System.out::println);
    }

    /**
     * Enable HTTP tracing for Spring Boot
     */
    @Bean
    public HttpExchangeRepository httpTraceRepository() {
        return new InMemoryHttpExchangeRepository();
    }
}
