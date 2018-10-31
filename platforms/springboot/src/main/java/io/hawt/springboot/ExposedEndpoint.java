package io.hawt.springboot;

import java.util.Map;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class ExposedEndpoint implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(ConditionalOnExposedEndpoint.class.getName());

        if (attributes != null) {
            String endpointName = (String) attributes.get("name");
            Environment environment = context.getEnvironment();
            String property = environment.getProperty("management.endpoints.web.exposure.include");
            if (property != null && !property.isEmpty()) {
                for (String exposure : property.split(",")) {
                    if (exposure.equals(endpointName)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
