package io.hawt.introspect;

import io.hawt.util.introspect.support.ClassScanner;

import java.util.SortedMap;

/**
 * Dumps all the classes on the classpath using hte ClassScanner
 */
public class Main {

    public static void main(String[] args) {
        ClassScanner scanner = ClassScanner.newInstance();
        SortedMap<String, Class<?>> answer = scanner.getAllClassesMap();

        for (Class<?> aClass : answer.values()) {
            System.out.println(aClass.getName());
        }
    }
}
