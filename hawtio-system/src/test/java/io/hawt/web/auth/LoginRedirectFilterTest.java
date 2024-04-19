package io.hawt.web.auth;


import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;

import io.hawt.system.ConfigManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class LoginRedirectFilterTest {

    private LoginRedirectFilter loginRedirectFilter;
    private FilterConfig filterConfig;
    private ServletContext servletContext;

    @BeforeEach
    public void setUp() {
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
    }

    @Test
    public void shouldTestSecuredPaths() throws Exception {
        loginRedirectFilter = new LoginRedirectFilter();
        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(servletContext.getAttribute(ConfigManager.CONFIG_MANAGER)).thenReturn(new ConfigManager());
        loginRedirectFilter.init(filterConfig);
        assertTrue(loginRedirectFilter.isSecuredPath("/d"));
        assertTrue(loginRedirectFilter.isSecuredPath("/e/f"));
        assertTrue(loginRedirectFilter.isSecuredPath("/auth"));
        // these paths are not "secured" from the PoV of LoginRedirectFilter - however these are protected by
        // AuthenticationFilter
        assertFalse(loginRedirectFilter.isSecuredPath("/jolokia"));
        assertFalse(loginRedirectFilter.isSecuredPath("/jolokia/read/java.lang:type=Runtime/Name"));
        assertFalse(loginRedirectFilter.isSecuredPath("/favicon.ico"));
        assertFalse(loginRedirectFilter.isSecuredPath("/auth/login"));
        assertFalse(loginRedirectFilter.isSecuredPath("/auth/logout"));
    }

    @Test
    public void customizedUnsecuredPaths() throws Exception {
        String[] unsecuredPaths = { "/hawtio/auth", "/hawtio/secret/content" };
        loginRedirectFilter = new LoginRedirectFilter(unsecuredPaths, "/");
        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(servletContext.getAttribute(ConfigManager.CONFIG_MANAGER)).thenReturn(new ConfigManager());
        loginRedirectFilter.init(filterConfig);
        assertTrue(loginRedirectFilter.isSecuredPath("/d"));
        assertTrue(loginRedirectFilter.isSecuredPath("/e/f"));
        assertFalse(loginRedirectFilter.isSecuredPath("/hawtio/auth/login"));
        assertFalse(loginRedirectFilter.isSecuredPath("/hawtio/secret/content/secure"));
    }
}
