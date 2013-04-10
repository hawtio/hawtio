package io.hawt.jsonschema;

import com.fasterxml.jackson.databind.module.SimpleModule;

/**
 * @author Stan Lewis
 */
public class BeanValidationAnnotationModule extends SimpleModule {

    public BeanValidationAnnotationModule() {
        super("bean-validation-annotations");
    }

    @Override
    public void setupModule(SetupContext context) {
        BeanValidationAnnotationIntrospector introspector = new BeanValidationAnnotationIntrospector(context.getTypeFactory());

        context.appendAnnotationIntrospector(introspector);
    }

}
