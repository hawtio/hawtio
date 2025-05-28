package io.hawt.v1.hawtiospec.config;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"additionalInfo","copyright","imgSrc","productInfo","title"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class About implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The text for the description section
     */
    @com.fasterxml.jackson.annotation.JsonProperty("additionalInfo")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The text for the description section")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String additionalInfo;

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
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
     * The image displayed in the page.
     * It can be a path, relative to the Hawtio status URL, or an absolute URL.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("imgSrc")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The image displayed in the page.\nIt can be a path, relative to the Hawtio status URL, or an absolute URL.")
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
    private java.util.List<io.hawt.v1.hawtiospec.config.about.ProductInfo> productInfo;

    public java.util.List<io.hawt.v1.hawtiospec.config.about.ProductInfo> getProductInfo() {
        return productInfo;
    }

    public void setProductInfo(java.util.List<io.hawt.v1.hawtiospec.config.about.ProductInfo> productInfo) {
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

