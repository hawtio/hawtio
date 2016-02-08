package io.hawt.spring;

import java.util.Map;
import java.util.SortedSet;

/**
 * The JMX MBean interface for working with spring application contexts
 * which are configured via the hawtio configuration registry (i.e. git based wiki)
 */
public interface WatcherSpringContextFacadeMXBean {

    SortedSet<String> getLocations();

    Map<String, String[]> beanDefinitionNameMap();

    Integer getBeanDefinitionCount();
}
