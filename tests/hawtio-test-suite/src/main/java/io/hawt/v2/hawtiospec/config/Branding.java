package io.hawt.v2.hawtiospec.config;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"appLogoUrl","appName","css","favicon"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Branding implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The URL of the logo, that displays in the navigation bar.
     * It can be a path, relative to the Hawtio status URL, or an absolute URL.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("appLogoUrl")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The URL of the logo, that displays in the navigation bar.\nIt can be a path, relative to the Hawtio status URL, or an absolute URL.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String appLogoUrl;

    public String getAppLogoUrl() {
        return appLogoUrl;
    }

    public void setAppLogoUrl(String appLogoUrl) {
        this.appLogoUrl = appLogoUrl;
    }

    /**
     * The application title, that usually displays in the Web browser tab.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("appName")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The application title, that usually displays in the Web browser tab.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String appName;

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    /**
     * The URL of an external CSS stylesheet, that can be used to style the application.
     * It can be a path, relative to the Hawtio status URL, or an absolute URL.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("css")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The URL of an external CSS stylesheet, that can be used to style the application.\nIt can be a path, relative to the Hawtio status URL, or an absolute URL.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String css;

    public String getCss() {
        return css;
    }

    public void setCss(String css) {
        this.css = css;
    }

    /**
     * The URL of the favicon, that usually displays in the Web browser tab.
     * It can be a path, relative to the Hawtio status URL, or an absolute URL.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("favicon")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The URL of the favicon, that usually displays in the Web browser tab.\nIt can be a path, relative to the Hawtio status URL, or an absolute URL.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String favicon;

    public String getFavicon() {
        return favicon;
    }

    public void setFavicon(String favicon) {
        this.favicon = favicon;
    }
}

