package io.hawt.jsonschema.mixins;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hawt.jsonschema.SchemaLookup;
import io.hawt.jsonschema.api.MixInAnnotation;
import org.fusesource.fabric.api.CreateEnsembleOptions;
import org.fusesource.fabric.api.CreateRemoteContainerOptions;

/**
 * @author Stan Lewis
 */
public class CreateContainerRemoteMixinOverrides implements MixInAnnotation {

    public CreateContainerRemoteMixinOverrides() {
        SchemaLookup.getSingleton().registerMixIn(this);
    }

    @Override
    public Class getMixinSource() {
        return CreateRemoteContainerMixin.class;
    }

    @Override
    public Class getTarget() {
        return CreateRemoteContainerOptions.class;
    }
}


interface CreateRemoteContainerMixin extends CreateRemoteContainerOptions {

    @JsonIgnore
    CreateEnsembleOptions getCreateEnsembleOptions();

    @JsonIgnore
    void setCreateEnsembleOptions(CreateEnsembleOptions createEnsembleOptions);


}
