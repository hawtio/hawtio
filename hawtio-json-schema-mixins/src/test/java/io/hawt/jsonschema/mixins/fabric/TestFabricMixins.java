package io.hawt.jsonschema.mixins.fabric;

import io.hawt.jsonschema.SchemaLookup;
import io.hawt.jsonschema.mixins.CreateContainerBasicMixinOverrides;
import io.hawt.jsonschema.mixins.CreateContainerRemoteMixinOverrides;
import org.junit.Assert;
import org.junit.Test;

/**
 * @author Stan Lewis
 */
public class TestFabricMixins {

    protected SchemaLookup createSchemaLookup() {
        SchemaLookup lookup = new SchemaLookup();
        lookup.init();
        return lookup;
    }

    @Test
    public void testCreateContainerOptionsMixin() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        lookup.registerMixIn(new CreateContainerBasicMixinOverrides());
        lookup.registerMixIn(new CreateContainerRemoteMixinOverrides());

        String result = "";

        result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateContainerChildOptions");

        System.out.println("Child container options : " + result);
        Assert.assertTrue(!result.contains("creationStateListener"));
        Assert.assertTrue(!result.contains("zookeeper"));

        result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateSshContainerOptions");

        System.out.println("SSH container options : " + result);
        Assert.assertTrue(!result.contains("creationStateListener"));
        Assert.assertTrue(!result.contains("zookeeper"));

        result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateJCloudsContainerOptions");

        System.out.println("JClouds container options : " + result);
        Assert.assertTrue(!result.contains("creationStateListener"));
        Assert.assertTrue(!result.contains("zookeeper"));

    }


}
