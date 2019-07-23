package io.hawt.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.junit.Test;
import static io.hawt.web.ServletHelpers.HEADER_HAWTIO_FORBIDDEN_REASON;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;
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
