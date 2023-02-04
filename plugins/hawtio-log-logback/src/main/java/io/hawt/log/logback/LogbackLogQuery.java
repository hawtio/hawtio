package io.hawt.log.logback;

import java.util.ArrayList;
import java.util.List;

import ch.qos.logback.classic.spi.LoggingEvent;
import ch.qos.logback.core.Appender;
import ch.qos.logback.core.AppenderBase;
import ch.qos.logback.core.Context;
import ch.qos.logback.core.spi.AppenderAttachable;
import io.hawt.log.LogEvent;
import io.hawt.log.LogFilter;
import io.hawt.log.LogResults;
import io.hawt.log.support.LogQueryBase;
import io.hawt.log.support.LruList;
import io.hawt.log.support.Predicate;
import org.slf4j.ILoggerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An implementation of {@link LogbackLogQueryMBean}.
 */
public class LogbackLogQuery extends LogQueryBase implements LogbackLogQueryMBean {

    private static final Logger LOG = LoggerFactory.getLogger(LogbackLogQuery.class);

    private static final String APPENDER_NAME = "LogQuery";

    private int size = 2000;
    private LruList<LoggingEvent> events;

    private final Appender<LoggingEvent> appender = new HawtioAppender();

    private final LoggingEventMapper eventMapper;

    public LogbackLogQuery() {
        super();
        eventMapper = new LoggingEventMapper(getHostName());
    }

    @Override
    public void start() {
        super.start();
        appender.start();
        reconnectAppender();
    }

    @Override
    public void reconnectAppender() {
        ILoggerFactory loggerFactory = LoggerFactory.getILoggerFactory();
        Logger root = loggerFactory.getLogger(ch.qos.logback.classic.Logger.ROOT_LOGGER_NAME);

        if (root instanceof AppenderAttachable) {
            appender.setContext((Context) loggerFactory);
            @SuppressWarnings("unchecked")
            AppenderAttachable<LoggingEvent> attachable = (AppenderAttachable<LoggingEvent>) root;
            attachable.addAppender(appender);
            LOG.info("Connected to Logback appender to trap logs with Hawtio log plugin");
        } else {
            LOG.warn("No appender-attachable root logger found so cannot attach Hawtio log appender!");
        }
    }

    @Override
    public void logMessage(LoggingEvent record) {
        getEvents().add(record);
    }

    @Override
    public LogResults getLogResults(int count) {
        return filterLogResults(null, count);
    }

    @Override
    public LogResults queryLogResults(LogFilter filter) {
        Predicate<LogEvent> predicate = createPredicate(filter);
        int count = filter == null ? -1 : filter.getCount();
        return filterLogResults(predicate, count);
    }

    protected LogResults filterLogResults(Predicate<LogEvent> predicate, int maxCount) {
        int matched = 0;
        long from = Long.MAX_VALUE;
        long to = Long.MIN_VALUE;
        List<LogEvent> list = new ArrayList<>();
        Iterable<LoggingEvent> elements = getEvents().getElements();
        for (LoggingEvent element : elements) {
            LogEvent logEvent = eventMapper.toLogEvent(element);
            long timestamp = element.getTimeStamp();
            if (timestamp > to) {
                to = timestamp;
            }
            if (timestamp < from) {
                from = timestamp;
            }
            if (predicate == null || predicate.matches(logEvent)) {
                list.add(logEvent);
                matched += 1;
                if (maxCount > 0 && matched >= maxCount) {
                    break;
                }
            }
        }

        LogResults results = new LogResults();
        results.setEvents(list);
        if (from < Long.MAX_VALUE) {
            results.setFromTimestamp(from);
        }
        if (to > Long.MIN_VALUE) {
            results.setToTimestamp(to);
        }
        LOG.debug("Requested {} logging items, returning {} event(s) from possible {}",
            maxCount, results.getEvents().size(), getEvents().size());
        return results;
    }

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    public LruList<LoggingEvent> getEvents() {
        if (events == null) {
            events = new LruList<>(LoggingEvent.class, getSize());
        }
        return events;
    }

    @Override
    public int getSize() {
        return size;
    }

    /**
     * Only for testing.
     */
    public void setSize(int size) {
        this.size = size;
    }

    private class HawtioAppender extends AppenderBase<LoggingEvent> {
        public HawtioAppender() {
            setName(APPENDER_NAME);
        }

        @Override
        protected void append(LoggingEvent event) {
            logMessage(event);
        }
    }
}
