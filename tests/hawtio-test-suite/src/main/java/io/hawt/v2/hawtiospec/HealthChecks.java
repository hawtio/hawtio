package io.hawt.v2.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"gatewayLivenessPeriod","gatewayReadinessPeriod","onlineLivenessPeriod","onlineReadinessPeriod"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class HealthChecks implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * Configure the period, in seconds, between gateway container liveness probe checks
     */
    @com.fasterxml.jackson.annotation.JsonProperty("gatewayLivenessPeriod")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Configure the period, in seconds, between gateway container liveness probe checks")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Integer gatewayLivenessPeriod;

    public Integer getGatewayLivenessPeriod() {
        return gatewayLivenessPeriod;
    }

    public void setGatewayLivenessPeriod(Integer gatewayLivenessPeriod) {
        this.gatewayLivenessPeriod = gatewayLivenessPeriod;
    }

    /**
     * Configure the period, in seconds, between gateway container readiness probe checks
     */
    @com.fasterxml.jackson.annotation.JsonProperty("gatewayReadinessPeriod")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Configure the period, in seconds, between gateway container readiness probe checks")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Integer gatewayReadinessPeriod;

    public Integer getGatewayReadinessPeriod() {
        return gatewayReadinessPeriod;
    }

    public void setGatewayReadinessPeriod(Integer gatewayReadinessPeriod) {
        this.gatewayReadinessPeriod = gatewayReadinessPeriod;
    }

    /**
     * Configure the period, in seconds, between online container liveness probe checks
     */
    @com.fasterxml.jackson.annotation.JsonProperty("onlineLivenessPeriod")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Configure the period, in seconds, between online container liveness probe checks")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Integer onlineLivenessPeriod;

    public Integer getOnlineLivenessPeriod() {
        return onlineLivenessPeriod;
    }

    public void setOnlineLivenessPeriod(Integer onlineLivenessPeriod) {
        this.onlineLivenessPeriod = onlineLivenessPeriod;
    }

    /**
     * Configure the period, in seconds, between online container readiness probe checks
     */
    @com.fasterxml.jackson.annotation.JsonProperty("onlineReadinessPeriod")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Configure the period, in seconds, between online container readiness probe checks")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Integer onlineReadinessPeriod;

    public Integer getOnlineReadinessPeriod() {
        return onlineReadinessPeriod;
    }

    public void setOnlineReadinessPeriod(Integer onlineReadinessPeriod) {
        this.onlineReadinessPeriod = onlineReadinessPeriod;
    }
}

