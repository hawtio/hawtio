package io.hawt.jsonschema;

public interface SchemaLookupMXBean {

    /**
     * Returns a JSON schema representing the desired class
     */
    public String getSchemaForClass(String name);

}
