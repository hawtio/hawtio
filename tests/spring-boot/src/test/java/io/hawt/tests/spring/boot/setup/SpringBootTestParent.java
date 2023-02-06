package io.hawt.tests.spring.boot.setup;

import org.junit.runner.RunWith;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import io.cucumber.spring.CucumberContextConfiguration;
import io.hawt.tests.spring.boot.SpringBootService;

@CucumberContextConfiguration
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SpringBootService.class, webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT, properties = "spring.jmx.enabled=true")
public class SpringBootTestParent {
    protected SpringBootTestParent() {

    }
}
