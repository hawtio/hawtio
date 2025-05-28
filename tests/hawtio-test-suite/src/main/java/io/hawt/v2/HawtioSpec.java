package io.hawt.v2;

@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
@com.fasterxml.jackson.annotation.JsonPropertyOrder({"auth","config","externalRoutes","metadataPropagation","nginx","rbac","replicas","resources","route","routeHostName","type","version"})
@com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.fasterxml.jackson.databind.JsonDeserializer.None.class)
public class HawtioSpec implements io.fabric8.kubernetes.api.model.KubernetesResource {

    /**
     * The authentication configuration
     */
    @com.fasterxml.jackson.annotation.JsonProperty("auth")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The authentication configuration")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.Auth auth;

    public io.hawt.v2.hawtiospec.Auth getAuth() {
        return auth;
    }

    public void setAuth(io.hawt.v2.hawtiospec.Auth auth) {
        this.auth = auth;
    }

    /**
     * The Hawtio console configuration
     */
    @com.fasterxml.jackson.annotation.JsonProperty("config")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Hawtio console configuration")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.Config config;

    public io.hawt.v2.hawtiospec.Config getConfig() {
        return config;
    }

    public void setConfig(io.hawt.v2.hawtiospec.Config config) {
        this.config = config;
    }

    /**
     * List of external route names that will be annotated by the operator to access the console using the routes
     */
    @com.fasterxml.jackson.annotation.JsonProperty("externalRoutes")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("List of external route names that will be annotated by the operator to access the console using the routes")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private java.util.List<String> externalRoutes;

    public java.util.List<String> getExternalRoutes() {
        return externalRoutes;
    }

    public void setExternalRoutes(java.util.List<String> externalRoutes) {
        this.externalRoutes = externalRoutes;
    }

    /**
     * The configuration for which metadata on Hawtio custom resources to propagate to
     * generated resources such as deployments, pods, services, and routes.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("metadataPropagation")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The configuration for which metadata on Hawtio custom resources to propagate to\ngenerated resources such as deployments, pods, services, and routes.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.MetadataPropagation metadataPropagation;

    public io.hawt.v2.hawtiospec.MetadataPropagation getMetadataPropagation() {
        return metadataPropagation;
    }

    public void setMetadataPropagation(io.hawt.v2.hawtiospec.MetadataPropagation metadataPropagation) {
        this.metadataPropagation = metadataPropagation;
    }

    /**
     * The Nginx runtime configuration
     */
    @com.fasterxml.jackson.annotation.JsonProperty("nginx")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Nginx runtime configuration")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.Nginx nginx;

    public io.hawt.v2.hawtiospec.Nginx getNginx() {
        return nginx;
    }

    public void setNginx(io.hawt.v2.hawtiospec.Nginx nginx) {
        this.nginx = nginx;
    }

    /**
     * The RBAC configuration
     */
    @com.fasterxml.jackson.annotation.JsonProperty("rbac")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The RBAC configuration")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.Rbac rbac;

    public io.hawt.v2.hawtiospec.Rbac getRbac() {
        return rbac;
    }

    public void setRbac(io.hawt.v2.hawtiospec.Rbac rbac) {
        this.rbac = rbac;
    }

    /**
     * Number of desired pods. This is a pointer to distinguish between explicit
     * zero and not specified. Defaults to 1.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("replicas")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Number of desired pods. This is a pointer to distinguish between explicit\nzero and not specified. Defaults to 1.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Integer replicas;

    public Integer getReplicas() {
        return replicas;
    }

    public void setReplicas(Integer replicas) {
        this.replicas = replicas;
    }

    /**
     * The Hawtio console compute resources
     */
    @com.fasterxml.jackson.annotation.JsonProperty("resources")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Hawtio console compute resources")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.Resources resources;

    public io.hawt.v2.hawtiospec.Resources getResources() {
        return resources;
    }

    public void setResources(io.hawt.v2.hawtiospec.Resources resources) {
        this.resources = resources;
    }

    /**
     * Custom certificate configuration for the route
     */
    @com.fasterxml.jackson.annotation.JsonProperty("route")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("Custom certificate configuration for the route")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private io.hawt.v2.hawtiospec.Route route;

    public io.hawt.v2.hawtiospec.Route getRoute() {
        return route;
    }

    public void setRoute(io.hawt.v2.hawtiospec.Route route) {
        this.route = route;
    }

    /**
     * The edge host name of the route that exposes the Hawtio service
     * externally. If not specified, it is automatically generated and
     * is of the form:
     * <name>[-<namespace>].<suffix>
     * where <suffix> is the default routing sub-domain as configured for
     * the cluster.
     * Note that the operator will recreate the route if the field is emptied,
     * so that the host is re-generated.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("routeHostName")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The edge host name of the route that exposes the Hawtio service\nexternally. If not specified, it is automatically generated and\nis of the form:\n<name>[-<namespace>].<suffix>\nwhere <suffix> is the default routing sub-domain as configured for\nthe cluster.\nNote that the operator will recreate the route if the field is emptied,\nso that the host is re-generated.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String routeHostName;

    public String getRouteHostName() {
        return routeHostName;
    }

    public void setRouteHostName(String routeHostName) {
        this.routeHostName = routeHostName;
    }

    public enum Type {

        @com.fasterxml.jackson.annotation.JsonProperty("Cluster")
        CLUSTER("Cluster"), @com.fasterxml.jackson.annotation.JsonProperty("Namespace")
        NAMESPACE("Namespace");

        java.lang.String value;

        Type(java.lang.String value) {
            this.value = value;
        }
    }

    /**
     * The deployment type. Defaults to cluster.
     * cluster: Hawtio is capable of discovering and managing
     * applications across all namespaces the authenticated user
     * has access to.
     * namespace: Hawtio is capable of discovering and managing
     * applications within the deployment namespace.
     */
    @com.fasterxml.jackson.annotation.JsonProperty("type")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The deployment type. Defaults to cluster.\ncluster: Hawtio is capable of discovering and managing\napplications across all namespaces the authenticated user\nhas access to.\nnamespace: Hawtio is capable of discovering and managing\napplications within the deployment namespace.")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private Type type;

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    /**
     * The Hawtio console container image version.
     * Deprecated: Remains for legacy purposes in respect of older
     * operators (<1.0.0) still requiring it for their installs
     */
    @com.fasterxml.jackson.annotation.JsonProperty("version")
    @com.fasterxml.jackson.annotation.JsonPropertyDescription("The Hawtio console container image version.\nDeprecated: Remains for legacy purposes in respect of older\noperators (<1.0.0) still requiring it for their installs")
    @com.fasterxml.jackson.annotation.JsonSetter(nulls = com.fasterxml.jackson.annotation.Nulls.SKIP)
    private String version;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}

