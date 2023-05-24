package io.hawt.tests.quarkus.suites;

import io.hawt.tests.quarkus.cucumber.CucumberOptions;
import io.hawt.tests.quarkus.cucumber.CucumberQuarkusTest;
import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
@CucumberOptions(
    features = "classpath:io/hawt/tests/features",
    glue = {"io.hawt.tests.quarkus", "io.hawt.tests.features"},
    tags = "@quarkusSmokeTest",
    plugin = {"pretty"})
public class QuarkusSmokeTest extends CucumberQuarkusTest {
}
