package io.hawt.util;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public final class ReflectionHelper {

    /**
     * A helper method to create a new instance of a type using the default
     * constructor arguments.
     */
    public static <T> T newInstance(Class<T> type) {
        try {
            return type.newInstance();
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * A helper method to invoke a method via reflection and wrap any exceptions
     * as {@link RuntimeException} instances
     *
     * @param method     the method to invoke
     * @param instance   the object instance (or null for static methods)
     * @param parameters the parameters to the method
     * @return the result of the method invocation
     */
    public static Object invokeMethod(Method method, Object instance, Object... parameters) {
        if (method == null) {
            return null;
        }
        try {
            return method.invoke(instance, parameters);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e.getCause());
        }
    }

    /**
     * Returns true if the given type has a method with the given annotation
     */
    public static boolean hasMethodWithAnnotation(Class<?> type,
                                                  Class<? extends Annotation> annotationType,
                                                  boolean checkMetaAnnotations) {
        try {
            do {
                Method[] methods = type.getDeclaredMethods();
                for (Method method : methods) {
                    if (hasAnnotation(method, annotationType, checkMetaAnnotations)) {
                        return true;
                    }
                }
                type = type.getSuperclass();
            } while (type != null);
        } catch (Throwable e) {
            // ignore a class loading issue
        }
        return false;
    }

    /**
     * Checks if a Class or Method are annotated with the given annotation
     *
     * @param elem                 the Class or Method to reflect on
     * @param annotationType       the annotation type
     * @param checkMetaAnnotations check for meta annotations
     * @return true if annotations is present
     */
    public static boolean hasAnnotation(AnnotatedElement elem, Class<? extends Annotation> annotationType,
                                        boolean checkMetaAnnotations) {
        if (elem.isAnnotationPresent(annotationType)) {
            return true;
        }
        if (checkMetaAnnotations) {
            for (Annotation a : elem.getAnnotations()) {
                for (Annotation meta : a.annotationType().getAnnotations()) {
                    if (meta.annotationType().getName().equals(annotationType.getName())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
