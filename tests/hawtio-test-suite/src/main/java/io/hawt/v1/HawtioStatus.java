package io.hawt.v1;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"URL","image","phase","replicas","selector"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class HawtioStatus implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The Hawtio console route URL
     */
    @com.fasterxml.jackson.annotation.JsonProperty("URL")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Hawtio console route URL")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String URL;

    public String getURL() {
        return URL;
    }

    public void setURL(String URL) {
        this.URL = URL;
    }

    /**
     * The Hawtio console container image
     */
    @com.fasterxml.jackson.annotation.JsonProperty("image")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Hawtio console container image")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String image;

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public enum Phase {

        @com.fasterxml.jackson.annotation.JsonProperty("Initialized")
        INITIALIZED("Initialized"), @com.fasterxml.jackson.annotation.JsonProperty("Deployed")
        DEPLOYED("Deployed"), @com.fasterxml.jackson.annotation.JsonProperty("Failed")
        FAILED("Failed");

        java.lang.String value;

        Phase(java.lang.String value) {
            this.value = value;
        }
    }

    /**
     * The Hawtio deployment phase
     */
    @com.fasterxml.jackson.annotation.JsonProperty("phase")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Hawtio deployment phase")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Phase phase;

    public Phase getPhase() {
        return phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
    }

    /**
     * The actual number of pods
     */
    @com.fasterxml.jackson.annotation.JsonProperty("replicas")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The actual number of pods")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Integer replicas;

    public Integer getReplicas() {
        return replicas;
    }

    public void setReplicas(Integer replicas) {
        this.replicas = replicas;
    }

    /**
     * The label selector for the Hawtio pods
     */
    @com.fasterxml.jackson.annotation.JsonProperty("selector")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The label selector for the Hawtio pods")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String selector;

    public String getSelector() {
        return selector;
    }

    public void setSelector(String selector) {
        this.selector = selector;
    }
}

