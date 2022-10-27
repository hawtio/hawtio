package io.hawt.web.auth;

import org.junit.Before;
import org.junit.Test;

import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

public class LoginRedirectFilterTest {

    private LoginRedirectFilter loginRedirectFilter;
    private FilterConfig filterConfig;
    private ServletContext servletContext;

    @Before
    public void setUp() {
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
    }

    @Test
    public void shouldTestSecuredPaths() throws Exception {
        loginRedirectFilter = new LoginRedirectFilter();
        when(filterConfig.getServletContext()).thenReturn(servletContext);
        loginRedirectFilter.init(filterConfig);
        assertTrue(loginRedirectFilter.isSecuredPath("/d"));
        assertTrue(loginRedirectFilter.isSecuredPath("/e/f"));
        assertTrue(loginRedirectFilter.isSecuredPath("/auth"));
        assertFalse(loginRedirectFilter.isSecuredPath("/auth/login"));
        assertFalse(loginRedirectFilter.isSecuredPath("/auth/logout"));
    }

    @Test
    public void customizedUnsecuredPaths() throws Exception {
        String[] unsecuredPaths = {"/hawtio/auth", "/hawtio/secret/content"};
        loginRedirectFilter = new LoginRedirectFilter(unsecuredPaths);

        when(filterConfig.getServletContext()).thenReturn(servletContext);
        loginRedirectFilter.init(filterConfig);
        assertTrue(loginRedirectFilter.isSecuredPath("/d"));
        assertTrue(loginRedirectFilter.isSecuredPath("/e/f"));
        assertFalse(loginRedirectFilter.isSecuredPath("/hawtio/auth/login"));
        assertFalse(loginRedirectFilter.isSecuredPath("/hawtio/secret/content/secure"));
    }
}
