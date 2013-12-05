package io.hawt.maven.util;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public final class TestHelper {

    public static List<Method> findTestMethods(Class clazz, Class annotation, String filter) throws Exception {
        List<Method> methods = findMethodsWithAnnotation(clazz, annotation, false);

        if (filter != null) {
            for (Method method : methods) {
                if (method.getName().equals(filter)) {
                    methods.remove(method);
                    break;
                }
            }
        }

        return methods;
    }

    public static List<Method> findMethodsWithAnnotation(Class<?> type,
                                                         Class<? extends Annotation> annotationType,
                                                         boolean checkMetaAnnotations) {
        List<Method> answer = new ArrayList<Method>();
        do {
            Method[] methods = type.getDeclaredMethods();
            for (Method method : methods) {
                if (hasAnnotation(method, annotationType, checkMetaAnnotations)) {
                    answer.add(method);
                }
            }
            type = type.getSuperclass();
        } while (type != null);
        return answer;
    }

    /**
     * Checks if a Class or Method are annotated with the given annotation
     *
     * @param elem the Class or Method to reflect on
     * @param annotationType the annotation type
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
