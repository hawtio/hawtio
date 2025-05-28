package io.hawt.v2.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"configMap","disableRBACRegistry"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Rbac implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The name of the ConfigMap that contains the ACL definition.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("configMap")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The name of the ConfigMap that contains the ACL definition.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String configMap;

    public String getConfigMap() {
        return configMap;
    }

    public void setConfigMap(String configMap) {
        this.configMap = configMap;
    }

    /**
     * Disable performance improvement brought by RBACRegistry and revert to the classic behavior. Defaults to `false`.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("disableRBACRegistry")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Disable performance improvement brought by RBACRegistry and revert to the classic behavior. Defaults to `false`.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Boolean disableRBACRegistry;

    public Boolean getDisableRBACRegistry() {
        return disableRBACRegistry;
    }

    public void setDisableRBACRegistry(Boolean disableRBACRegistry) {
        this.disableRBACRegistry = disableRBACRegistry;
    }
}

