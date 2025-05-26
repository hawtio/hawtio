package io.hawt.v1;

@io.fabric8.kubernetes.model.annotation.Version(value = "v1" , storage = false , served = true)
@io.fabric8.kubernetes.model.annotation.Group("hawt.io")
@io.fabric8.kubernetes.model.annotation.Plural("hawtios")
public class Hawtio extends io.fabric8.kubernetes.client.CustomResource<io.hawt.v1.HawtioSpec, io.hawt.v1.HawtioStatus> implements io.fabric8.kubernetes.api.model.Namespaced {
}

