package io.hawt.jsonschema.test.fabric;

import io.hawt.jsonschema.SchemaLookup;
import io.hawt.jsonschema.mixins.CreateContainerBasicMixinOverrides;
import io.hawt.jsonschema.mixins.CreateContainerChildMixinOverrides;
import io.hawt.jsonschema.mixins.CreateContainerNoParentMixinOverrides;
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
        new CreateContainerBasicMixinOverrides();
        new CreateContainerRemoteMixinOverrides();
        new CreateContainerNoParentMixinOverrides();
        new CreateContainerChildMixinOverrides();
        return lookup;
    }

    @Test
    public void testCreateContainerChildOptionsMixin() throws Exception {
        SchemaLookup lookup = createSchemaLookup();

        String result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateContainerChildOptions");

        System.out.println("Child container options : " + result);
        Assert.assertTrue(!result.contains("creationStateListener"));
        Assert.assertTrue(!result.contains("zookeeper"));
        Assert.assertTrue(!result.contains("providerType"));
        Assert.assertTrue(!result.contains("metadataMap"));

        Assert.assertTrue(!result.contains("ensembleServer"));
        Assert.assertTrue(!result.contains("preferredAddress"));
        Assert.assertTrue(!result.contains("resolver"));
        Assert.assertTrue(!result.contains("proxyUri"));
        Assert.assertTrue(!result.contains("adminAccess"));

    }

    @Test
    public void testCreateSshContainerOptionsMixin() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateSshContainerOptions");

        System.out.println("SSH container options : " + result);
        Assert.assertTrue(!result.contains("creationStateListener"));
        Assert.assertTrue(!result.contains("zookeeper"));
        Assert.assertTrue(!result.contains("providerType"));
        Assert.assertTrue(!result.contains("metadataMap"));
        Assert.assertTrue(!result.contains("parent"));

    }

    public void testCreateJCloudContainerOptionsMixin() throws Exception {
        SchemaLookup lookup = createSchemaLookup();
        String result = lookup.getSchemaForClass("org.fusesource.fabric.api.CreateJCloudsContainerOptions");

        System.out.println("JClouds container options : " + result);
        Assert.assertTrue(!result.contains("creationStateListener"));
        Assert.assertTrue(!result.contains("zookeeper"));
        Assert.assertTrue(!result.contains("providerType"));
        Assert.assertTrue(!result.contains("metadataMap"));
        Assert.assertTrue(!result.contains("parent"));

    }


}
