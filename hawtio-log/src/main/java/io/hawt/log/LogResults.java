package io.hawt.log;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Results of a query which also records the first and last timestamp searched
 */
public class LogResults implements Serializable {
    private static final long serialVersionUID = 1L;
    private List<LogEvent> events;
    private Long fromTimestamp;
    private Long toTimestamp;
    private String host;

    public void addEvent(LogEvent event) {
        if (events == null) {
            events = new ArrayList<LogEvent>();
        }
        events.add(event);
    }

    public List<LogEvent> getEvents() {
        return events;
    }

    public void setEvents(List<LogEvent> events) {
        this.events = events;
    }

    public Long getFromTimestamp() {
        return fromTimestamp;
    }

    public void setFromTimestamp(Long fromTimestamp) {
        this.fromTimestamp = fromTimestamp;
    }

    public Long getToTimestamp() {
        return toTimestamp;
    }

    public void setToTimestamp(Long toTimestamp) {
        this.toTimestamp = toTimestamp;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }
}
