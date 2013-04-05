package io.hawt.jsonschema;


import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {
    private SchemaLookup schemaLookup;

    @Override
    public void start(BundleContext context) throws Exception {
        schemaLookup = new SchemaLookup(context);
        schemaLookup.init();
    }

    @Override
    public void stop(BundleContext context) throws Exception {
        schemaLookup.destroy();
    }
}
