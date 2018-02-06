package io.hawt.log.osgi;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import io.hawt.log.LogFilter;
import io.hawt.log.LogResults;
import io.hawt.log.support.LogQuerySupport;
import io.hawt.log.support.Predicate;
import org.apache.karaf.log.core.LogService;
import org.ops4j.pax.logging.spi.PaxLoggingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An implementation of {@link LogQueryMBean} using the embedded pax appender used by karaf
 */
public class LogQuery extends LogQuerySupport implements LogQueryMBean {
    private transient Logger LOG = LoggerFactory.getLogger(LogQuery.class);

    private final LogService logService;

    public LogQuery(LogService logService) {
        this.logService = logService;
        mapper.getSerializationConfig().withPropertyInclusion(JsonInclude.Value.construct(JsonInclude.Include.NON_EMPTY, Include.ALWAYS));
    }

    @Override
    public String getBundleMavenCoordinates(long bundleId) {
        return MavenCoordinates.getMavenCoordinates(bundleId);
    }

    @Override
    public LogResults getLogResults(int count) throws IOException {
        LogResults events = getLogEventList(count, null);
        return events;
    }

    @Override
    public LogResults queryLogResults(LogFilter filter) {
        Predicate<PaxLoggingEvent> predicate = Logs.createPredicate(filter);
        int count = -1;
        if (filter != null) {
            count = filter.getCount();
        }
        return getLogEventList(count, predicate);
    }

    public LogResults getLogEventList(int count, Predicate<PaxLoggingEvent> predicate) {
        LogResults answer = new LogResults();
        answer.setHost(getHostName());

        long from = Long.MAX_VALUE;
        long to = Long.MIN_VALUE;
        if (logService != null) {
            Iterable<PaxLoggingEvent> iterable = logService.getEvents();
            if (iterable != null) {
                int matched = 0;
                for (PaxLoggingEvent event : iterable) {
                    if (event != null) {
                        long timestamp = event.getTimeStamp();
                        if (timestamp > to) {
                            to = timestamp;
                        }
                        if (timestamp < from) {
                            from = timestamp;
                        }
                        if (predicate == null || predicate.matches(event)) {
                            answer.addEvent(Logs.newInstance(event));
                            matched += 1;
                            if (count > 0 && matched >= count) {
                                break;
                            }
                        }
                    }
                }
            }
        } else {
            LOG.warn("No Karaf LogService available!");
        }
        answer.setFromTimestamp(from);
        answer.setToTimestamp(to);
        return answer;
    }
}