package io.hawt.camel;

import org.apache.camel.util.LoadPropertiesException;

import java.io.IOException;
import java.util.List;

/**
 * The JMX MBean interface for working with camel
 */
public interface CamelFacadeMXBean {
    String findCustomEndpointsJson() throws LoadPropertiesException;
}
