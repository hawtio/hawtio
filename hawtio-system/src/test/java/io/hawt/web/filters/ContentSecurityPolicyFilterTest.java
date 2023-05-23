package io.hawt.web.filters;

import java.util.Objects;
import java.util.Optional;

import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.hawt.system.ConfigManager;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import org.junit.Before;
import org.junit.Test;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ContentSecurityPolicyFilterTest {

    private ContentSecurityPolicyFilter contentSecurityPolicyFilter;
    private FilterConfig filterConfig;
    private ServletContext servletContext;
    private ConfigManager configManager;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private String keycloakConfigFile;

    @Before
    public void setUp() {
        contentSecurityPolicyFilter = new ContentSecurityPolicyFilter();
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
        configManager = mock(ConfigManager.class);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        keycloakConfigFile = Objects.requireNonNull(getClass().getClassLoader().getResource("keycloak-hawtio-client.json")).getFile();

        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(servletContext.getAttribute("ConfigManager")).thenReturn(configManager);

        System.clearProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG);
    }

    @Test
    public void shouldSetHeader() throws Exception {
        // given
        contentSecurityPolicyFilter.init(filterConfig);
        // when
        contentSecurityPolicyFilter.addHeaders(request, response);
        // then
        verify(response).addHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ; "
                + "style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' ; frame-src 'self' ; "
                + "frame-ancestors 'none'");
    }

    @Test
    public void shouldSetHeaderWithKeycloakServerWhenConfigParameterIsSet() throws Exception {
        // given
        when(configManager.get(KeycloakServlet.KEYCLOAK_CLIENT_CONFIG)).thenReturn(Optional.ofNullable(keycloakConfigFile));
        contentSecurityPolicyFilter.init(filterConfig);
        // when
        contentSecurityPolicyFilter.addHeaders(request, response);
        // then
        verify(response).addHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:8180; "
                + "style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' http://localhost:8180; frame-src 'self' http://localhost:8180; "
                + "frame-ancestors 'none'");
    }

    @Test
    public void shouldSetHeaderWithKeycloakServerWhenSystemPropertyIsSet() throws Exception {
        // given
        System.setProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG, keycloakConfigFile);
        contentSecurityPolicyFilter.init(filterConfig);
        // when
        contentSecurityPolicyFilter.addHeaders(request, response);
        // then
        verify(response).addHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:8180; "
                + "style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' http://localhost:8180; frame-src 'self' http://localhost:8180; "
                + "frame-ancestors 'none'");
    }

    @Test
    public void shouldNotNPEWithBlankStringAsKeycloakConfigFile() throws Exception {
        // given
        System.setProperty(KeycloakServlet.HAWTIO_KEYCLOAK_CLIENT_CONFIG, "");
        contentSecurityPolicyFilter.init(filterConfig);
        // when
        contentSecurityPolicyFilter.addHeaders(request, response);
        // then
        verify(response).addHeader(eq("Content-Security-Policy"), eq(
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self' ; frame-src 'self' ; frame-ancestors 'none'"));
    }

    @Test
    public void shouldSetHeaderWithFrameAncestorsSelfWhenConfigParameterIsSet() throws Exception {
        // given
        when(configManager.get(HttpHeaderFilter.ALLOW_X_FRAME_SAME_ORIGIN)).thenReturn(Optional.of("true"));
        contentSecurityPolicyFilter.init(filterConfig);
        // when
        contentSecurityPolicyFilter.addHeaders(request, response);
        // then
        verify(response).addHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ; "
                + "style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' ; frame-src 'self' ; "
                + "frame-ancestors 'self'");
    }
}
