package io.hawt.jsonschema;

/**
 * @author Stan Lewis
 */
public interface SchemaLookupMXBean {

    /**
     *
     * Returns a JSON schema representing the desired class
     *
     * @param name
     * @return
     */
    public String getSchemaForClass(String name);

}
