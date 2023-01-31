package io.hawt.log.logback;

import ch.qos.logback.classic.spi.LoggingEvent;
import io.hawt.log.support.LogQuerySupportMBean;

/**
 * The MBean operations for {@link LogbackLogQuery}
 */
public interface LogbackLogQueryMBean extends LogQuerySupportMBean {
    /**
     * Provides a hook you can call if the underlying log4j
     * configuration is reloaded so that you can force the appender
     * to get re-registered.
     */
    void reconnectAppender();

    void logMessage(LoggingEvent record);

    int getSize();
}
