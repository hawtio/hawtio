package io.hawt.jsonschema.internal;

import com.fasterxml.jackson.core.Version;
import com.fasterxml.jackson.databind.AnnotationIntrospector;
import com.fasterxml.jackson.databind.introspect.AnnotatedMember;
import com.fasterxml.jackson.databind.introspect.AnnotatedMethod;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import java.beans.Introspector;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Modifier;

public class BeanValidationAnnotationIntrospector extends AnnotationIntrospector {
    private static final transient Logger LOG = LoggerFactory.getLogger(BeanValidationAnnotationIntrospector.class);

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
    public boolean hasIgnoreMarker(AnnotatedMember m) {
        Member member = m.getMember();
        int modifiers = member.getModifiers();
        if (Modifier.isTransient(modifiers)) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("Ignoring transient member " + m);
            }
            return true;
        } else if (m instanceof AnnotatedMethod) {
            AnnotatedMethod method = (AnnotatedMethod) m;
            String methodName = method.getName();
            // lets see if there is a transient field of the same name as the getter
            if (methodName.startsWith("get") && method.getParameterCount() == 0) {
                String fieldName = Introspector.decapitalize(methodName.substring(3));
                Class<?> declaringClass = method.getDeclaringClass();
                Field field = findField(fieldName, declaringClass);
                if (field != null) {
                    int fieldModifiers = field.getModifiers();
                    if (Modifier.isTransient(fieldModifiers)) {
                        if (LOG.isDebugEnabled()) {
                            LOG.debug("Ignoring member " + m + " due to transient field called " + fieldName);
                        }
                        return true;
                    }
                }
            }
        }
        return super.hasIgnoreMarker(m);

    }

    protected static Field findField(String fieldName, Class<?> declaringClass) {
        try {
            return declaringClass.getDeclaredField(fieldName);
        } catch (NoSuchFieldException e) {
            Class<?> superclass = declaringClass.getSuperclass();
            if (superclass != null && superclass != declaringClass) {
                return findField(fieldName, superclass);
            } else {
                return null;
            }
        }
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
