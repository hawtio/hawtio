package io.hawt.v2.hawtiospec.config;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"additionalInfo","backgroundDarkModeImgSrc","backgroundImgSrc","copyright","imgDarkModeSrc","imgSrc","productInfo","title"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class About implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * Deprecated: Use Description instead. This field is retained for backwards
     * compatibility but will be removed in a future release.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("additionalInfo")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Deprecated: Use Description instead. This field is retained for backwards\ncompatibility but will be removed in a future release.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String additionalInfo;

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    /**
     * The background image to display in dark mode on the About dialog
     */
    @com.fasterxml.jackson.annotation.JsonProperty("backgroundDarkModeImgSrc")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The background image to display in dark mode on the About dialog")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String backgroundDarkModeImgSrc;

    public String getBackgroundDarkModeImgSrc() {
        return backgroundDarkModeImgSrc;
    }

    public void setBackgroundDarkModeImgSrc(String backgroundDarkModeImgSrc) {
        this.backgroundDarkModeImgSrc = backgroundDarkModeImgSrc;
    }

    /**
     * The background image to display on the About dialog
     */
    @com.fasterxml.jackson.annotation.JsonProperty("backgroundImgSrc")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The background image to display on the About dialog")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String backgroundImgSrc;

    public String getBackgroundImgSrc() {
        return backgroundImgSrc;
    }

    public void setBackgroundImgSrc(String backgroundImgSrc) {
        this.backgroundImgSrc = backgroundImgSrc;
    }

    /**
     * The text for the copyright section
     */
    @com.fasterxml.jackson.annotation.JsonProperty("copyright")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The text for the copyright section")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String copyright;

    public String getCopyright() {
        return copyright;
    }

    public void setCopyright(String copyright) {
        this.copyright = copyright;
    }

    /**
     * The image displayed in the page if the theme is dark mode.
     * It can be a path, relative to the Hawtio status URL, or an absolute URL.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("imgDarkModeSrc")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The image displayed in the page if the theme is dark mode.\nIt can be a path, relative to the Hawtio status URL, or an absolute URL.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String imgDarkModeSrc;

    public String getImgDarkModeSrc() {
        return imgDarkModeSrc;
    }

    public void setImgDarkModeSrc(String imgDarkModeSrc) {
        this.imgDarkModeSrc = imgDarkModeSrc;
    }

    /**
     * The image displayed in the page, by default.
     * It can be a path, relative to the Hawtio status URL, or an absolute URL.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("imgSrc")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The image displayed in the page, by default.\nIt can be a path, relative to the Hawtio status URL, or an absolute URL.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String imgSrc;

    public String getImgSrc() {
        return imgSrc;
    }

    public void setImgSrc(String imgSrc) {
        this.imgSrc = imgSrc;
    }

    /**
     * List of product information
     */
    @com.fasterxml.jackson.annotation.JsonProperty("productInfo")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("List of product information")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.List<io.hawt.v2.hawtiospec.config.about.ProductInfo> productInfo;

    public java.util.List<io.hawt.v2.hawtiospec.config.about.ProductInfo> getProductInfo() {
        return productInfo;
    }

    public void setProductInfo(java.util.List<io.hawt.v2.hawtiospec.config.about.ProductInfo> productInfo) {
        this.productInfo = productInfo;
    }

    /**
     * The title of the page
     */
    @com.fasterxml.jackson.annotation.JsonProperty("title")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The title of the page")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String title;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}

