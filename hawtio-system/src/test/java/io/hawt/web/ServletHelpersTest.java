package io.hawt.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
    public void testDoForbiddenJsonResponse() throws IOException {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletOutputStream servletOutputStream = mock(ServletOutputStream.class);

        when(httpRequest.getHeader("Accept")).thenReturn("application/json, text/javascript, */*; q=0.01");
        when(httpResponse.getOutputStream()).thenReturn(servletOutputStream);

        ServletHelpers.doForbidden(httpRequest, httpResponse);

        byte[] bytes = "{\"reason\":\"NONE\"}".getBytes(StandardCharsets.UTF_8);
        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentType("application/json");
        verify(httpResponse).setContentLength(bytes.length);
        verify(servletOutputStream).write(bytes);
        verify(httpResponse).flushBuffer();
    }

    @Test
    public void testDoForbiddenJsonResponseWithCustomReason() throws IOException {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletOutputStream servletOutputStream = mock(ServletOutputStream.class);

        when(httpRequest.getHeader("Accept")).thenReturn("application/json, text/javascript, */*; q=0.01");
        when(httpResponse.getOutputStream()).thenReturn(servletOutputStream);

        ServletHelpers.doForbidden(httpRequest, httpResponse, ForbiddenReason.HOST_NOT_ALLOWED);

        byte[] bytes = "{\"reason\":\"HOST_NOT_ALLOWED\"}".getBytes(StandardCharsets.UTF_8);
        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentType("application/json");
        verify(httpResponse).setContentLength(bytes.length);
        verify(servletOutputStream).write(bytes);
        verify(httpResponse).flushBuffer();
    }

    @Test
    public void testDoForbidden() throws IOException {
        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletOutputStream servletOutputStream = mock(ServletOutputStream.class);

        when(httpRequest.getHeader("Accept")).thenReturn("text/plain, */*; q=0.01");
        when(httpResponse.getOutputStream()).thenReturn(servletOutputStream);

        ServletHelpers.doForbidden(httpRequest, httpResponse);

        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentLength(0);
        verify(httpResponse).flushBuffer();
    }

}
