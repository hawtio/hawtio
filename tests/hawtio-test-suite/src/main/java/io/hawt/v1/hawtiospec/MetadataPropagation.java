package io.hawt.v1.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"annotations","labels"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class MetadataPropagation implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * Annotations to propagate
     */
    @com.fasterxml.jackson.annotation.JsonProperty("annotations")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Annotations to propagate")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.List<String> annotations;

    public java.util.List<String> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(java.util.List<String> annotations) {
        this.annotations = annotations;
    }

    /**
     * Labels to propagate
     */
    @com.fasterxml.jackson.annotation.JsonProperty("labels")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Labels to propagate")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.List<String> labels;

    public java.util.List<String> getLabels() {
        return labels;
    }

    public void setLabels(java.util.List<String> labels) {
        this.labels = labels;
    }
}

