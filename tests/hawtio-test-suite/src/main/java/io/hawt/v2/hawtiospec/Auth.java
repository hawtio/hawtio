package io.hawt.v2.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"clientCertCheckSchedule","clientCertCommonName","clientCertExpirationDate","clientCertExpirationPeriod","internalSSL"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Auth implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * CronJob schedule that defines how often the expiry of the certificate will be checked.
     * Client rotation isn't enabled if the schedule isn't set.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("clientCertCheckSchedule")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("CronJob schedule that defines how often the expiry of the certificate will be checked.\nClient rotation isn't enabled if the schedule isn't set.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String clientCertCheckSchedule;

    public String getClientCertCheckSchedule() {
        return clientCertCheckSchedule;
    }

    public void setClientCertCheckSchedule(String clientCertCheckSchedule) {
        this.clientCertCheckSchedule = clientCertCheckSchedule;
    }

    /**
     * The generated client certificate CN
     */
    @com.fasterxml.jackson.annotation.JsonProperty("clientCertCommonName")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The generated client certificate CN")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String clientCertCommonName;

    public String getClientCertCommonName() {
        return clientCertCommonName;
    }

    public void setClientCertCommonName(String clientCertCommonName) {
        this.clientCertCommonName = clientCertCommonName;
    }

    /**
     * The generated client certificate expiration date
     */
    @com.fasterxml.jackson.annotation.JsonProperty("clientCertExpirationDate")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The generated client certificate expiration date")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String clientCertExpirationDate;

    public String getClientCertExpirationDate() {
        return clientCertExpirationDate;
    }

    public void setClientCertExpirationDate(String clientCertExpirationDate) {
        this.clientCertExpirationDate = clientCertExpirationDate;
    }

    /**
     * The duration in hours before the expiration date, during which the certification can be rotated.
     * The default is set to 24 hours.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("clientCertExpirationPeriod")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The duration in hours before the expiration date, during which the certification can be rotated.\nThe default is set to 24 hours.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Long clientCertExpirationPeriod;

    public Long getClientCertExpirationPeriod() {
        return clientCertExpirationPeriod;
    }

    public void setClientCertExpirationPeriod(Long clientCertExpirationPeriod) {
        this.clientCertExpirationPeriod = clientCertExpirationPeriod;
    }

    /**
     * Use SSL for internal communication
     */
    @com.fasterxml.jackson.annotation.JsonProperty("internalSSL")
    @javax.validation.constraints.NotNull()
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Use SSL for internal communication")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Boolean internalSSL = io.fabric8.kubernetes.client.utils.Serialization.unmarshal("true", Boolean.class);

    public Boolean getInternalSSL() {
        return internalSSL;
    }

    public void setInternalSSL(Boolean internalSSL) {
        this.internalSSL = internalSSL;
    }
}

