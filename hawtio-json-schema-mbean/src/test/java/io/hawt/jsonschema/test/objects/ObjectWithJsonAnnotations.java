package io.hawt.jsonschema.test.objects;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ObjectWithJsonAnnotations {

    @JsonProperty(value = "foobar")
    private String string1;

}
