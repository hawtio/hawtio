package io.hawt.log.rest;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LogResponse {
    private LogResponseHits hits;

    @JsonCreator
    public LogResponse(@JsonProperty("hits") LogResponseHits hits) {
        this.hits = hits;
    }

    public LogResponseHits getHits() {
        return hits;
    }

    public void setHits(LogResponseHits hits) {
        this.hits = hits;
    }

}
