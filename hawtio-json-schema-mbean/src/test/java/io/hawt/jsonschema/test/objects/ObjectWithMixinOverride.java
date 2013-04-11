package io.hawt.jsonschema.test.objects;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Stan Lewis
 */
public class ObjectWithMixinOverride {

    @JsonProperty(value="cheese")
    public String string1;

}
