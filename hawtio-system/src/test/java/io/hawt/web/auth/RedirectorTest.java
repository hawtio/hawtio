package io.hawt.web.auth;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;

public class RedirectorTest {

    private Redirector redirector;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private ServletContext servletContext;

    @Before
    public void setUp() {
        redirector = new Redirector();
        redirector.setApplicationContextPath("/application-context-path");
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        servletContext = mock(ServletContext.class);

        when(request.getServerName()).thenReturn("server01");
        when(request.getServerPort()).thenReturn(9000);
        when(request.getContextPath()).thenReturn("/context-path");
        when(request.getServletContext()).thenReturn(servletContext);
    }

    @Test
    public void shouldRedirectToRelativeUrlByDefault() throws Exception {
        // given
        when(servletContext.getInitParameter("scheme")).thenReturn(null);
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("/context-path/application-context-path/path");
    }

    @Test
    public void shouldRedirectToAbsoluteUrlWhenSchemeIsConfigured() throws Exception {
        // given
        when(servletContext.getInitParameter("scheme")).thenReturn("https");
        // when
        redirector.doRedirect(request, response, "/path");
        // then
        verify(response).sendRedirect("https://server01:9000/context-path/application-context-path/path");
    }

}
