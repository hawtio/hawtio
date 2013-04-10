package io.hawt.jsonschema;

import com.fasterxml.jackson.core.Version;
import com.fasterxml.jackson.databind.AnnotationIntrospector;
import com.fasterxml.jackson.databind.introspect.AnnotatedMember;
import com.fasterxml.jackson.databind.type.TypeFactory;

import javax.validation.constraints.NotNull;

/**
 * @author Stan Lewis
 */
public class BeanValidationAnnotationIntrospector extends AnnotationIntrospector {

    protected final TypeFactory typeFactory;

    @Override
    public Version version() {
        // TODO - guess this maybe needs to be property generated from the build
        return new Version(1, 1, 0, "", "io.hawt", "hawtio-json-schema-mbean");
    }

    public BeanValidationAnnotationIntrospector(TypeFactory typeFactory) {
        this.typeFactory = (typeFactory == null) ? TypeFactory.defaultInstance() : typeFactory;
    }

    @Override
    public Boolean hasRequiredMarker(AnnotatedMember m) {
        NotNull annotation = m.getAnnotation(NotNull.class);
        if (annotation == null) {
            return null;
        }
        return Boolean.TRUE;
    }


}
