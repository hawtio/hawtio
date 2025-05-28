package io.hawt.v1.hawtiospec;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"caCert","certSecret"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class Route implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * Ca certificate secret key selector
     */
    @com.fasterxml.jackson.annotation.JsonProperty("caCert")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Ca certificate secret key selector")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v1.hawtiospec.route.CaCert caCert;

    public io.hawt.v1.hawtiospec.route.CaCert getCaCert() {
        return caCert;
    }

    public void setCaCert(io.hawt.v1.hawtiospec.route.CaCert caCert) {
        this.caCert = caCert;
    }

    /**
     * Name of the TLS secret with the custom certificate used for the route TLS termination
     */
    @com.fasterxml.jackson.annotation.JsonProperty("certSecret")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Name of the TLS secret with the custom certificate used for the route TLS termination")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v1.hawtiospec.route.CertSecret certSecret;

    public io.hawt.v1.hawtiospec.route.CertSecret getCertSecret() {
        return certSecret;
    }

    public void setCertSecret(io.hawt.v1.hawtiospec.route.CertSecret certSecret) {
        this.certSecret = certSecret;
    }
}

