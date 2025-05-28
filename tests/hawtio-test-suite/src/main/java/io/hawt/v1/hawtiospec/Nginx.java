package io.hawt.v1.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"clientBodyBufferSize","proxyBuffers","subrequestOutputBufferSize"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Nginx implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The buffer size for reading client request body. Defaults to `256k`.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("clientBodyBufferSize")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The buffer size for reading client request body. Defaults to `256k`.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String clientBodyBufferSize;

    public String getClientBodyBufferSize() {
        return clientBodyBufferSize;
    }

    public void setClientBodyBufferSize(String clientBodyBufferSize) {
        this.clientBodyBufferSize = clientBodyBufferSize;
    }

    /**
     * The number and size of the buffers used for reading a response from
     * the proxied server, for a single connection. Defaults to `16 128k`.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("proxyBuffers")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The number and size of the buffers used for reading a response from\nthe proxied server, for a single connection. Defaults to `16 128k`.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String proxyBuffers;

    public String getProxyBuffers() {
        return proxyBuffers;
    }

    public void setProxyBuffers(String proxyBuffers) {
        this.proxyBuffers = proxyBuffers;
    }

    /**
     * The size of the buffer used for storing the response body of a subrequest.
     * Defaults to `10m`.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("subrequestOutputBufferSize")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The size of the buffer used for storing the response body of a subrequest.\nDefaults to `10m`.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String subrequestOutputBufferSize;

    public String getSubrequestOutputBufferSize() {
        return subrequestOutputBufferSize;
    }

    public void setSubrequestOutputBufferSize(String subrequestOutputBufferSize) {
        this.subrequestOutputBufferSize = subrequestOutputBufferSize;
    }
}

