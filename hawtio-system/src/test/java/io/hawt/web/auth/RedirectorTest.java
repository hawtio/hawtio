package io.hawt.web.auth;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class RedirectorTest {

    private Redirector redirector;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private ServletContext servletContext;

    @BeforeEach
    public void setUp() {
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        servletContext = mock(ServletContext.class);

        when(request.getServerName()).thenReturn("server01");
        when(request.getContextPath()).thenReturn("/context-path");
        when(request.getServletContext()).thenReturn(servletContext);
    }

    @AfterEach
    public void tearDown() {
        System.clearProperty(Redirector.HAWTIO_REDIRECT_SCHEME);
    }

    @Test
    public void shouldRedirectToRelativeUrlByDefault() throws Exception {
        // given
        redirector = new Redirector();
        redirector.setApplicationContextPath("/application-context-path");
        when(servletContext.getInitParameter("scheme")).thenReturn(null);
        when(request.getServerPort()).thenReturn(9000);
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("/context-path/application-context-path/path");
    }

    @Test
    public void shouldRedirectToAbsoluteUrlWhenSchemeIsConfigured1() throws Exception {
        // given
        redirector = new Redirector();
        redirector.setApplicationContextPath("/application-context-path");
        when(servletContext.getInitParameter("scheme")).thenReturn("https");
        when(request.getServerPort()).thenReturn(9000);
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("https://server01:9000/context-path/application-context-path/path");
    }

    @Test
    public void shouldRedirectToAbsoluteUrlWhenSchemeIsConfigured2() throws Exception {
        // given
        System.setProperty(Redirector.HAWTIO_REDIRECT_SCHEME, "https");
        redirector = new Redirector();
        redirector.setApplicationContextPath("/application-context-path");
        when(request.getServerPort()).thenReturn(9000);
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("https://server01:9000/context-path/application-context-path/path");
    }

    @Test
    public void shouldRedirectToAbsoluteUrlWhenSchemeIsConfiguredPort80() throws Exception {
        // given
        System.setProperty(Redirector.HAWTIO_REDIRECT_SCHEME, "http");
        redirector = new Redirector();
        redirector.setApplicationContextPath("/application-context-path");
        when(request.getServerPort()).thenReturn(80);
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("http://server01/context-path/application-context-path/path");
    }

    @Test
    public void shouldRedirectToAbsoluteUrlWhenSchemeIsConfiguredPort443() throws Exception {
        // given
        System.setProperty(Redirector.HAWTIO_REDIRECT_SCHEME, "https");
        redirector = new Redirector();
        redirector.setApplicationContextPath("/application-context-path");
        when(request.getServerPort()).thenReturn(443);
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("https://server01/context-path/application-context-path/path");
    }

}
