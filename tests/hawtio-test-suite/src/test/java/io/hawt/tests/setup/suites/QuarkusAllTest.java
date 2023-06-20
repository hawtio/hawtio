package io.hawt.tests.setup.suites;

import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;

@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@quarkusAllTest and not @notQuarkus")
public class QuarkusAllTest extends TestParent{
}
