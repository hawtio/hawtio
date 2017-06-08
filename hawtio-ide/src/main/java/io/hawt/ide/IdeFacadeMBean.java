package io.hawt.ide;

/**
 * The JMX MBean interface for working with IDEs
 */
public interface IdeFacadeMBean {

	/**
	 * Attempt to open a source reference in a Java IDE
	 */
	String ideOpen(String fileName, String className, Integer line, Integer column) throws Exception;
}
