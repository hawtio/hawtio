package io.hawt.log.log4j;

import io.hawt.log.support.LogQuerySupportMBean;
import org.apache.log4j.spi.LoggingEvent;

/**
 * The MBean operations for {@link Log4jLogQuery}
 */
public interface Log4jLogQueryMBean extends LogQuerySupportMBean {

    /**
     * Provides a hook you can call if the underlying log4j
     * configuration is reloaded so that you can force the appender
     * to get re-registered.
     */
    void reconnectAppender();

    public void logMessage(LoggingEvent record);
}
