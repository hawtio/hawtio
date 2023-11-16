package io.hawt.v1alpha1.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"limits","requests"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Resources implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/
     */
    @com.fasterxml.jackson.annotation.JsonProperty("limits")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.Map<java.lang.String, io.fabric8.kubernetes.api.model.IntOrString> limits;

    public java.util.Map<java.lang.String, io.fabric8.kubernetes.api.model.IntOrString> getLimits() {
        return limits;
    }

    public void setLimits(java.util.Map<java.lang.String, io.fabric8.kubernetes.api.model.IntOrString> limits) {
        this.limits = limits;
    }

    /**
     * Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/
     */
    @com.fasterxml.jackson.annotation.JsonProperty("requests")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.Map<java.lang.String, io.fabric8.kubernetes.api.model.IntOrString> requests;

    public java.util.Map<java.lang.String, io.fabric8.kubernetes.api.model.IntOrString> getRequests() {
        return requests;
    }

    public void setRequests(java.util.Map<java.lang.String, io.fabric8.kubernetes.api.model.IntOrString> requests) {
        this.requests = requests;
    }
}

