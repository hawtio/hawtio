package io.hawt.jsonschema.mixins;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hawt.jsonschema.SchemaLookup;
import io.hawt.jsonschema.api.MixInAnnotation;
import org.fusesource.fabric.api.CreateJCloudsContainerOptions;
import org.fusesource.fabric.api.CreateSshContainerOptions;

/**
 * @author Stan Lewis
 */
public class CreateContainerNoParentMixinOverrides {

    public CreateContainerNoParentMixinOverrides() {
        SchemaLookup.getSingleton().registerMixIn(new MixInAnnotation() {

            @Override
            public Class getMixinSource() {
                return CreateSshContainerMixin.class;
            }

            @Override
            public Class getTarget() {
                return CreateSshContainerOptions.class;
            }
        });

        SchemaLookup.getSingleton().registerMixIn(new MixInAnnotation() {
            @Override
            public Class getMixinSource() {
                return CreateSshContainerMixin.class;
            }

            @Override
            public Class getTarget() {
                return CreateJCloudsContainerOptions.class;
            }
        });
    }

}

class CreateSshContainerMixin {

    @JsonIgnore
    protected String parent;

    @JsonIgnore
    public String getParent() {
        return parent;
    }

    @JsonIgnore
    public void setParent(String parent) {
        this.parent = parent;
    }

}
