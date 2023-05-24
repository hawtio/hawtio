package io.hawt.tests.spring.boot.suites;

import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("io/hawt/tests/features/")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@springBootAllTest")
public class SpringBootAllTest {

}
