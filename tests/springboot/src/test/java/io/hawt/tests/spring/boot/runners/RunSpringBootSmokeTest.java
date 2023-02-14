package io.hawt.tests.spring.boot.runners;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import io.hawt.tests.spring.boot.setup.SpringBootTestParent;

import org.junit.runner.RunWith;

@RunWith(Cucumber.class)
@CucumberOptions(
    plugin = "pretty",
    features = "src/test/resources/features/",
    glue = {"io.hawt.tests.spring.boot", "io.hawt.tests.utils.stepdefinitions"},
    tags = "@springBootSmokeTest")
public class RunSpringBootSmokeTest extends SpringBootTestParent {
}
