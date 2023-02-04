package io.hawt.log.rest;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LogResponseHits {
    private List<LogResponseHit> hits;

    @JsonCreator
    public LogResponseHits(@JsonProperty("hits") List<LogResponseHit> hits) {
        this.hits = hits;
    }

    public List<LogResponseHit> getHits() {
        return hits;
    }

    public void setHits(List<LogResponseHit> hits) {
        this.hits = hits;
    }

}
