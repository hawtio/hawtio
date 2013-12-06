package io.hawt.junit;

import java.util.List;

/**
 * The MBean interface for working with hawtio junit plugin
 */
public interface JUnitFacadeMBean {

    ResultDTO runTestClasses(List<String> classNames) throws Exception;
}
