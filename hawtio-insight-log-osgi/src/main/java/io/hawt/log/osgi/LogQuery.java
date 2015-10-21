package io.hawt.log.osgi;

import java.io.IOException;
import javax.management.MBeanServer;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.hawt.log.LogFilter;
import io.hawt.log.LogResults;
import io.hawt.log.support.LogQuerySupport;
import io.hawt.log.support.Predicate;
import org.apache.felix.scr.annotations.Activate;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Deactivate;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.ReferenceCardinality;
import org.apache.felix.scr.annotations.ReferencePolicy;
import org.ops4j.pax.logging.spi.PaxLoggingEvent;
import org.osgi.service.log.LogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An implementation of {@link LogQueryMBean} using the embedded pax appender used by karaf
 */
@Component
public class LogQuery extends LogQuerySupport implements LogQueryMBean {
    private transient Logger LOG = LoggerFactory.getLogger(LogQuery.class);

    @Reference
    private MBeanServer mbeanServer;

    @Reference(referenceInterface = LogService.class, policy = ReferencePolicy.DYNAMIC, cardinality = ReferenceCardinality.OPTIONAL_MULTIPLE, bind = "bindLogService", unbind = "unbindLogService")
    private LogService logService;

    private volatile org.apache.karaf.log.core.LogService karafLogService;

    public LogQuery() {
        mapper.getSerializationConfig().withSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    }

    @Activate
    public void activate() {
        registerMBeanServer(mbeanServer);
    }

    @Deactivate
    public void deactivate() {
        unregisterMBeanServer(mbeanServer);
    }

    public void bindLogService(LogService service) {
        this.logService = service;
        if (service instanceof org.apache.karaf.log.core.LogService) {
            karafLogService = (org.apache.karaf.log.core.LogService) service;
        }
    }

    public void unbindLogService(LogService service) {
        if (logService != null && logService.equals(service)) {
            logService = null;
            karafLogService = null;
        }
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
        if (karafLogService != null) {
            Iterable<PaxLoggingEvent> iterable = karafLogService.getEvents();
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