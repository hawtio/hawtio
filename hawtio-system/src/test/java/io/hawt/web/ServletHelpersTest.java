package io.hawt.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.jolokia.converter.Converters;
import org.jolokia.converter.json.JsonConvertOptions;
import org.json.JSONObject;
import org.junit.Test;

import static io.hawt.web.ServletHelpers.HEADER_HAWTIO_FORBIDDEN_REASON;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

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

    @Test
    public void writeEmpty() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ServletHelpers.writeEmpty(new PrintWriter(out));
        assertThat(out.toString(), equalTo("{}"));
    }

    @Test
    public void writeObject() {
        Converters converters = new Converters();
        JsonConvertOptions options = JsonConvertOptions.DEFAULT;
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        ServletHelpers.writeObject(converters, options, new PrintWriter(out), Collections.emptyList());
        assertThat(out.toString(), equalTo("[]"));

        out.reset();
        Object obj = Map.of("string", "text", "number", 2, "boolean", true);
        ServletHelpers.writeObject(converters, options, new PrintWriter(out), obj);
        assertThat(out.toString(), equalTo("{\"number\":2,\"boolean\":true,\"string\":\"text\"}"));
    }

    @Test
    public void testDoForbiddenResponseWithCustomReason() throws IOException {
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletHelpers.doForbidden(httpResponse, ForbiddenReason.HOST_NOT_ALLOWED);
        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentLength(0);
        verify(httpResponse).setHeader(HEADER_HAWTIO_FORBIDDEN_REASON, ForbiddenReason.HOST_NOT_ALLOWED.name());
        verify(httpResponse).flushBuffer();
    }

    @Test
    public void testDoForbidden() throws IOException {
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletHelpers.doForbidden(httpResponse);
        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentLength(0);
        verify(httpResponse).setHeader(HEADER_HAWTIO_FORBIDDEN_REASON, ForbiddenReason.NONE.name());
        verify(httpResponse).flushBuffer();
    }
}
