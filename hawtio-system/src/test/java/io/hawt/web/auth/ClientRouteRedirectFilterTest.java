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

public class ClientRouteRedirectFilterTest {

    private ClientRouteRedirectFilter clientRouteRedirectFilter;
    private FilterConfig filterConfig;
    private ServletContext servletContext;

    @BeforeEach
    public void setUp() {
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
    }

    @Test
    public void shouldTestSecuredPaths() throws Exception {
        clientRouteRedirectFilter = new ClientRouteRedirectFilter();
        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(servletContext.getAttribute(ConfigManager.CONFIG_MANAGER)).thenReturn(new ConfigManager());
        clientRouteRedirectFilter.init(filterConfig);
        assertTrue(clientRouteRedirectFilter.isSecuredPath("/d"));
        assertTrue(clientRouteRedirectFilter.isSecuredPath("/e/f"));
        assertTrue(clientRouteRedirectFilter.isSecuredPath("/auth"));
        // these paths are not "secured" from the PoV of LoginRedirectFilter - however these are protected by
        // AuthenticationFilter
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/jolokia"));
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/jolokia/read/java.lang:type=Runtime/Name"));
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/favicon.ico"));
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/auth/login"));
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/auth/logout"));
    }

    @Test
    public void customizedUnsecuredPaths() throws Exception {
        String[] unsecuredPaths = { "/hawtio/auth", "/hawtio/secret/content" };
        clientRouteRedirectFilter = new ClientRouteRedirectFilter(unsecuredPaths, "/");
        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(servletContext.getAttribute(ConfigManager.CONFIG_MANAGER)).thenReturn(new ConfigManager());
        clientRouteRedirectFilter.init(filterConfig);
        assertTrue(clientRouteRedirectFilter.isSecuredPath("/d"));
        assertTrue(clientRouteRedirectFilter.isSecuredPath("/e/f"));
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/hawtio/auth/login"));
        assertFalse(clientRouteRedirectFilter.isSecuredPath("/hawtio/secret/content/secure"));
    }
}
