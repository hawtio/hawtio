package io.hawt.introspect;

import java.util.List;

/**
 * The JMX MBean interface for working with the introspector
 */
public interface IntrospectorMXBean {

    /**
     * Returns a list of properties for the given type name
     */
    List<PropertyDTO> getProperties(String className) throws Exception;
}
