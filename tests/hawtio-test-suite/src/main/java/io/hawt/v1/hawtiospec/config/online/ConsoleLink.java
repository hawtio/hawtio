package io.hawt.v1.hawtiospec.config.online;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"imageRelativePath","section","text"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class ConsoleLink implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The path, relative to the Hawtio status URL, for the icon used in front of the link in the application menu.
     * It is only applicable when the Hawtio deployment type is equal to 'cluster'.
     * The image should be square and will be shown at 24x24 pixels.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("imageRelativePath")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The path, relative to the Hawtio status URL, for the icon used in front of the link in the application menu.\nIt is only applicable when the Hawtio deployment type is equal to 'cluster'.\nThe image should be square and will be shown at 24x24 pixels.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String imageRelativePath;

    public String getImageRelativePath() {
        return imageRelativePath;
    }

    public void setImageRelativePath(String imageRelativePath) {
        this.imageRelativePath = imageRelativePath;
    }

    /**
     * The section of the application menu in which the link should appear.
     * It is only applicable when the Hawtio deployment type is equal to 'cluster'.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("section")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The section of the application menu in which the link should appear.\nIt is only applicable when the Hawtio deployment type is equal to 'cluster'.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String section;

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    /**
     * The text display for the link
     */
    @com.fasterxml.jackson.annotation.JsonProperty("text")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The text display for the link")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}

