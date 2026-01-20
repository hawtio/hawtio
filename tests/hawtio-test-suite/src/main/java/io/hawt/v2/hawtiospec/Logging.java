package io.hawt.v2.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"gatewayLogLevel","maskIPAddresses","onlineLogLevel"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Logging implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * Configure gateway log level {info|debug}
     */
    @com.fasterxml.jackson.annotation.JsonProperty("gatewayLogLevel")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Configure gateway log level {info|debug}")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String gatewayLogLevel;

    public String getGatewayLogLevel() {
        return gatewayLogLevel;
    }

    public void setGatewayLogLevel(String gatewayLogLevel) {
        this.gatewayLogLevel = gatewayLogLevel;
    }

    /**
     * Turn on/off the masking of IP addresses in logging {true|false} (off by default)
     * Warning: this can cause issues if ip address are part of MBean Idenfifiers so
     * use with caution.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("maskIPAddresses")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Turn on/off the masking of IP addresses in logging {true|false} (off by default)\nWarning: this can cause issues if ip address are part of MBean Idenfifiers so\nuse with caution.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String maskIPAddresses;

    public String getMaskIPAddresses() {
        return maskIPAddresses;
    }

    public void setMaskIPAddresses(String maskIPAddresses) {
        this.maskIPAddresses = maskIPAddresses;
    }

    /**
     * Configure online log level {emerg|alert|crit|error|warn|notice|info}
     */
    @com.fasterxml.jackson.annotation.JsonProperty("onlineLogLevel")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Configure online log level {emerg|alert|crit|error|warn|notice|info}")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String onlineLogLevel;

    public String getOnlineLogLevel() {
        return onlineLogLevel;
    }

    public void setOnlineLogLevel(String onlineLogLevel) {
        this.onlineLogLevel = onlineLogLevel;
    }
}

