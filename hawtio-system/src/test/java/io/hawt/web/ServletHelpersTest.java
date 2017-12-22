package io.hawt.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;

import org.json.JSONObject;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;


public class ServletHelpersTest {

    @Test
    public void readObject() throws Exception {
        String data = "{ string: 'text', number: 2, boolean: true }";
        JSONObject json = ServletHelpers.readObject(
            new BufferedReader(new InputStreamReader(new ByteArrayInputStream(data.getBytes()))));
        assertThat(json.get("string"), equalTo("text"));
        assertThat(json.get("number"), equalTo(2));
        assertThat(json.get("boolean"), equalTo(true));
    }

}
