package io.hawt.log.rest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.hawt.log.LogEvent;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LogResponseHit {

    @JsonProperty("_source")
    private LogEvent event;

    public LogResponseHit() {
    }

    public LogEvent getEvent() {
        return event;
    }

    public void setEvent(LogEvent event) {
        this.event = event;
    }

}
