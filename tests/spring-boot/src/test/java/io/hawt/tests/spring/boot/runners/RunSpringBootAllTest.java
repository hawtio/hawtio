package io.hawt.tests.spring.boot.runners;

import org.junit.runner.RunWith;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import io.hawt.tests.spring.boot.setup.SpringBootTestParent;

@RunWith(Cucumber.class)
@CucumberOptions(
    plugin = "pretty",
    features = "src/test/resources/features/",
    glue = {"io.hawt.tests.spring.boot", "io.hawt.tests.utils.stepdefinitions"},
    tags = "@springBootAllTests")
public class RunSpringBootAllTest extends SpringBootTestParent {
}
