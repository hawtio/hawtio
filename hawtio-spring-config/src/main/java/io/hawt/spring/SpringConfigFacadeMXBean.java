package io.hawt.spring;

import java.io.IOException;
import java.util.List;

/**
 * The JMX MBean interface for working with spring application contexts
 * which are configured via the hawtio configuration registry (i.e. git based wiki)
 */
public interface SpringConfigFacadeMXBean {

    String[] getLocations();

    String[] getBeanDefinitionNames();

    Integer getBeanDefinitionCount();
}
