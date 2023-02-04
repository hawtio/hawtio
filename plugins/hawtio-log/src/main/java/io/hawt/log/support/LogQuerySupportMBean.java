package io.hawt.log.support;

import java.io.IOException;

import io.hawt.log.LogFilter;
import io.hawt.log.LogResults;

/**
 * An MBean for querying log events which has a serialized API and a simple JSON API to avoid serialization issues
 */
public interface LogQuerySupportMBean {

    /**
     * Returns all the available recent log events as a {@link io.hawt.log.LogResults} object which is then serialized
     *
     * @return the log events as a serialized object
     */
    LogResults allLogResults() throws IOException;

    /**
     * Returns all the available log events since the given timestamp (millis)
     *
     * @return the log events as a serialized object
     */
    LogResults logResultsSince(long time) throws IOException;

    /**
     * Returns the recent log events as a {@link LogResults} object which is then serialized
     *
     * @param count maximum number to return o <0 for all of them
     * @return the log events as a serialized object
     */
    LogResults getLogResults(int count) throws IOException;

    /**
     * Queries the log results using the given filter
     *
     * @param filter the filter to apply to the logs
     * @return the log events as a serialized object
     */
    LogResults queryLogResults(LogFilter filter);

    /**
     * Returns the source file for the given maven coordinates so that we can link log messages
     * to source code
     *
     * @param mavenCoordinates is a string of the form "groupId:artifactId:version".
     *                         For some uber bundles this can be a space separated list.
     */
    String getSource(String mavenCoordinates, String className, String filePath) throws IOException;

    /**
     * Returns the javadoc file for the given maven coordinates and filePath
     *
     * @param mavenCoordinates is a string of the form "groupId:artifactId:version".
     *                         For some uber bundles this can be a space separated list.
     */
    String getJavaDoc(String mavenCoordinates, String filePath) throws IOException;

    // JSON API

    /**
     * Returns the recent log events as JSON
     *
     * @param count maximum number to return o <0 for all of them
     * @return the log events as a blob of JSON using {@link io.hawt.log.LogEvent}
     */
    String getLogEvents(int count) throws IOException;

    /**
     * Filters the list of log events using the JSON encoding of {@link io.hawt.log.LogFilter}
     *
     * @return the log events as a blob of JSON using {@link io.hawt.log.LogEvent}
     */
    String filterLogEvents(String jsonFiler) throws IOException;

    /**
     * Allows a JSON filter to be specified then returns the log results as a serialised object
     */
    LogResults jsonQueryLogResults(String jsonFilter) throws IOException;
}
