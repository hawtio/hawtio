package io.hawt.v2.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"about","branding","disabledRoutes","online"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Config implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The information to be displayed in the About page
     */
    @com.fasterxml.jackson.annotation.JsonProperty("about")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The information to be displayed in the About page")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.config.About about;

    public io.hawt.v2.hawtiospec.config.About getAbout() {
        return about;
    }

    public void setAbout(io.hawt.v2.hawtiospec.config.About about) {
        this.about = about;
    }

    /**
     * The UI branding
     */
    @com.fasterxml.jackson.annotation.JsonProperty("branding")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The UI branding")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.config.Branding branding;

    public io.hawt.v2.hawtiospec.config.Branding getBranding() {
        return branding;
    }

    public void setBranding(io.hawt.v2.hawtiospec.config.Branding branding) {
        this.branding = branding;
    }

    /**
     * Disables UI components with matching routes
     */
    @com.fasterxml.jackson.annotation.JsonProperty("disabledRoutes")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Disables UI components with matching routes")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.List<String> disabledRoutes;

    public java.util.List<String> getDisabledRoutes() {
        return disabledRoutes;
    }

    public void setDisabledRoutes(java.util.List<String> disabledRoutes) {
        this.disabledRoutes = disabledRoutes;
    }

    /**
     * The OpenShift related configuration
     */
    @com.fasterxml.jackson.annotation.JsonProperty("online")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The OpenShift related configuration")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.config.Online online;

    public io.hawt.v2.hawtiospec.config.Online getOnline() {
        return online;
    }

    public void setOnline(io.hawt.v2.hawtiospec.config.Online online) {
        this.online = online;
    }
}

