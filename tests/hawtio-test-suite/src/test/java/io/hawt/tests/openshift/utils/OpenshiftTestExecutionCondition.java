package io.hawt.tests.openshift.utils;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;

import io.hawt.tests.features.config.TestConfiguration;

public class OpenshiftTestExecutionCondition implements ExecutionCondition {

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext extensionContext) {

        return TestConfiguration.useOpenshift() ? ConditionEvaluationResult.enabled("Openshift if enabled") :
            ConditionEvaluationResult.disabled("Openshift is disabled");
    }
}
