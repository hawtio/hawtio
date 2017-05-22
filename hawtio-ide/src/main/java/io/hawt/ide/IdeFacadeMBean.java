package io.hawt.ide;

import java.util.List;

/**
 * The JMX MBean interface for working with IDEs
 */
public interface IdeFacadeMBean {

	/**
	 * Attempt to open a source reference in a Java IDE
	 */
	String ideOpen(String fileName, String className, Integer line, Integer column) throws Exception;
	
    /**
     * Open an absolute file name in IDEA and navigate to the position in the file
     * @deprecated Kept for compatibility with older frontends if relevant , prefer {@link #ideOpen(String, String, Integer, Integer)}
     */
	@Deprecated
    String ideaOpenAndNavigate(String absoluteFileName, int line, int column) throws Exception;
	
    /**
     * Given a class name and a file name, try to find the absolute file name of the
     * source file on the users machine or null if it cannot be found
     * @deprecated File resolution is now handled in {@link #ideOpen(String, String, Integer, Integer)}
     */
	@Deprecated
    String findClassAbsoluteFileName(String fileName, String className, List<String> sourceRoots);

}
