package io.hawt.springboot;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;

import org.springframework.boot.context.properties.bind.BindResult;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class ExposedEndpoint implements Condition {

    private static final String WEB_EXPOSURE_INCLUDE = "management.endpoints.web.exposure.include";
    private static final Bindable<List<String>> STRING_LIST = Bindable.listOf(String.class);

    @Override
    public boolean matches(@Nonnull ConditionContext context, AnnotatedTypeMetadata metadata) {
        Map<String, Object> attributes = metadata.getAnnotationAttributes(ConditionalOnExposedEndpoint.class.getName());

        if (attributes != null) {
            String endpointName = (String) attributes.get("name");
            Environment environment = context.getEnvironment();
            BindResult<List<String>> property = Binder.get(environment).bind(WEB_EXPOSURE_INCLUDE, STRING_LIST);
            List<String> exposedEndpoints = property.orElse(Collections.emptyList());
            return exposedEndpoints.contains(endpointName) || exposedEndpoints.contains("*");
        }

        return false;
    }
}
