package io.hawt.introspect;

import java.util.List;
import java.util.SortedSet;

/**
 * The JMX MBean interface for working with the introspector
 */
public interface IntrospectorMXBean {

    /**
     * Searches for the available class names given the text search
     *
     * @return all the class names found on the current classpath using the given text search filter
     */
    SortedSet<String> findClassNames(String search, Integer limit);

    SortedSet<String> findJUnitTestClassNames();

    /**
     * Returns a list of properties for the given type name
     */
    List<PropertyDTO> getProperties(String className) throws Exception;

    /**
     * Returns a list of properties available; supporting the navigation using dot of properties into
     * nested properties
     */
    List<PropertyDTO> findProperties(String className, String filter) throws Exception;

    /**
     * Clears the cache
     */
    void clearCache();

    /**
     * Returns the classes which have at least one method annotated with the given annotation class name
     */
    SortedSet<String> findClassNamesMethodsAnnotatedWith(String annotationClassName);
}
