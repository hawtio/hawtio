package io.hawt.v2;

@io.fabric8.kubernetes.model.annotation.Version(value = "v2" , storage = true , served = true)
@io.fabric8.kubernetes.model.annotation.Group("hawt.io")
@io.fabric8.kubernetes.model.annotation.Plural("hawtios")
public class Hawtio extends io.fabric8.kubernetes.client.CustomResource<io.hawt.v2.HawtioSpec, io.hawt.v2.HawtioStatus> implements io.fabric8.kubernetes.api.model.Namespaced {
}

