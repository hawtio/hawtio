package io.hawt.junit;

import io.hawt.util.ReflectionHelper;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.PatternSyntaxException;

public class DefaultJUnitService implements JUnitService {

    @Override
    public List<Method> findTestMethods(Class<?> clazz) throws Exception {

        // first find annotations
        Class<? extends Annotation> ann = loadAnnotationClass(clazz, "org.junit.Test");
        List<Method> annotations = findMethodsWithAnnotation(clazz, ann, false);

        // if no annotations then find by testXXX naming pattern
        List<Method> names = findMethodsWithName(clazz, "test*");

        List<Method> answer = new ArrayList<Method>();
        for (Method method : annotations) {
            if (!answer.contains(method)) {
                answer.add(method);
            }
        }
        for (Method method : names) {
            if (!answer.contains(method)) {
                answer.add(method);
            }
        }

        return answer;
    }

    @Override
    public List<Method> filterTestMethods(List<Method> methods, String filter) {

        boolean wildcard = filter != null && filter.endsWith("*");
        if (wildcard) {
            filter = filter.substring(0, filter.length() - 1);
        }

        List<Method> result = new ArrayList<Method>();
        if (filter != null) {
            for (Method method : methods) {
                if (wildcard && method.getName().startsWith(filter)) {
                    result.add(method);
                } else if (method.getName().equals(filter)) {
                    result.add(method);
                }
            }
        } else {
            result.addAll(methods);
        }

        return result;
    }

    @Override
    public Method findBefore(Class<?> clazz) throws Exception {
        // first find annotations
        Class<? extends Annotation> ann = loadAnnotationClass(clazz, "org.junit.Before");
        List<Method> annotations = findMethodsWithAnnotation(clazz, ann, false);
        if (!annotations.isEmpty()) {
            return annotations.get(0);
        }

        // if no annotations then assume setUp
        List<Method> names = findMethodsWithName(clazz, "setUp");
        if (!names.isEmpty()) {
            return names.get(0);
        }

        return null;
    }

    @Override
    public Method findBeforeClass(Class<?> clazz) throws Exception {
        // first find annotations
        Class<? extends Annotation> ann = loadAnnotationClass(clazz, "org.junit.BeforeClass");
        List<Method> annotations = findMethodsWithAnnotation(clazz, ann, false);
        if (!annotations.isEmpty()) {
            return annotations.get(0);
        }

        // there is no naming convention for before class
        return null;
    }

    @Override
    public Method findAfter(Class<?> clazz) throws Exception {
        // first find annotations
        Class<? extends Annotation> ann = loadAnnotationClass(clazz, "org.junit.After");
        List<Method> annotations = findMethodsWithAnnotation(clazz, ann, false);
        if (!annotations.isEmpty()) {
            return annotations.get(0);
        }

        // if no annotations then assume setUp
        List<Method> names = findMethodsWithName(clazz, "tearDown");
        if (!names.isEmpty()) {
            return names.get(0);
        }

        return null;
    }

    @Override
    public Method findAfterClass(Class<?> clazz) throws Exception {
        // first find annotations
        Class<? extends Annotation> ann = loadAnnotationClass(clazz, "org.junit.AfterClass");
        List<Method> annotations = findMethodsWithAnnotation(clazz, ann, false);
        if (!annotations.isEmpty()) {
            return annotations.get(0);
        }

        // there is no naming convention for after class
        return null;
    }

    private static Class<? extends Annotation> loadAnnotationClass(Class<?> clazz, String annotationClassName) throws ClassNotFoundException {
        return clazz.getClassLoader().loadClass(annotationClassName).asSubclass(Annotation.class);
    }

    private static List<Method> findMethodsWithName(Class<?> type, String namePattern) {
        List<Method> answer = new ArrayList<Method>();
        do {
            Method[] methods = type.getDeclaredMethods();
            for (Method method : methods) {
                if (matchPattern(method.getName(), namePattern)) {
                    answer.add(method);
                }
            }
            type = type.getSuperclass();
        } while (type != null);
        return answer;
    }

    private static List<Method> findMethodsWithAnnotation(Class<?> type,
                                                          Class<? extends Annotation> annotationType,
                                                          boolean checkMetaAnnotations) {
        List<Method> answer = new ArrayList<Method>();
        do {
            Method[] methods = type.getDeclaredMethods();
            for (Method method : methods) {
                if (ReflectionHelper.hasAnnotation(method, annotationType, checkMetaAnnotations)) {
                    answer.add(method);
                }
            }
            type = type.getSuperclass();
        } while (type != null);
        return answer;
    }

    private static boolean matchPattern(String name, String pattern) {
        if (name == null || pattern == null) {
            return false;
        }

        if (name.equals(pattern)) {
            // exact match
            return true;
        }

        if (matchWildcard(name, pattern)) {
            return true;
        }

        if (matchRegex(name, pattern)) {
            return true;
        }

        // no match
        return false;
    }

    private static boolean matchWildcard(String name, String pattern) {
        // we have wildcard support in that hence you can match with: file* to match any file endpoints
        if (pattern.endsWith("*") && name.startsWith(pattern.substring(0, pattern.length() - 1))) {
            return true;
        }
        return false;
    }

    private static boolean matchRegex(String name, String pattern) {
        // match by regular expression
        try {
            if (name.matches(pattern)) {
                return true;
            }
        } catch (PatternSyntaxException e) {
            // ignore
        }
        return false;
    }

}
