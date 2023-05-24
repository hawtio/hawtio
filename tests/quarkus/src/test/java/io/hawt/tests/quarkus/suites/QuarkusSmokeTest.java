package io.hawt.tests.quarkus.suites;

import io.hawt.tests.quarkus.cucumber.CucumberOptions;
import io.hawt.tests.quarkus.cucumber.CucumberQuarkusTest;
import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"io.hawt.tests.quarkus", "io.hawt.tests.utils.stepdefinitions"},
    tags = "@quarkusSmokeTest",
    plugin = {"json"})
public class QuarkusSmokeTest extends CucumberQuarkusTest {
}
