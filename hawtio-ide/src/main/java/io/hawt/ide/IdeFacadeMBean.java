package io.hawt.ide;

import java.util.List;

/**
 * The JMX MBean interface for working with IDEs
 */
public interface IdeFacadeMBean {

    /**
     * Given a class name and a file name, try to find the absolute file name of the
     * source file on the users machine or null if it cannot be found
     */
    String findClassAbsoluteFileName(String fileName, String className, List<String> sourceRoots);

    /**
     * Open an absolute file name in IDEA and navigate to the position in the file
     */
    String ideaOpenAndNavigate(String absoluteFileName, int line, int column) throws Exception;

    /**
     * Open an absolute file name in IDEA
     */
    String ideaOpen(String absoluteFileName) throws Exception;
}
