package io.hawt.tests.spring.boot.setup;

import org.springframework.boot.test.context.SpringBootTest;

import io.cucumber.spring.CucumberContextConfiguration;
import io.hawt.tests.spring.boot.SpringBootService;

@CucumberContextConfiguration
@SpringBootTest(classes = SpringBootService.class, webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT, properties = "spring.jmx.enabled=true")
public class SpringBootTestParent {
    protected SpringBootTestParent() {

    }
}
