package io.hawt.jsonschema;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Stan Lewis
 */
public class ObjectWithJsonAnnotations {

    @JsonProperty(value = "foobar")
    private String string1;

}
