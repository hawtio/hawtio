package io.hawt.web.filters;

import java.util.Objects;
import java.util.Optional;

import io.hawt.web.auth.AuthenticationConfiguration;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.hawt.system.ConfigManager;
import io.hawt.web.auth.keycloak.KeycloakServlet;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

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
    private String oidcConfigFile;

    @BeforeEach
    public void setUp() {
        contentSecurityPolicyFilter = new ContentSecurityPolicyFilter();
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
        configManager = mock(ConfigManager.class);
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        keycloakConfigFile = Objects.requireNonNull(getClass().getClassLoader().getResource("keycloak-hawtio-client.json")).getFile();
        oidcConfigFile = Objects.requireNonNull(getClass().getClassLoader().getResource("hawtio-oidc.properties")).getFile();

        when(configManager.getBoolean("authenticationEnabled", true)).thenReturn(true);
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
            "default-src 'self'; script-src 'self'; "
                + "style-src 'self'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self'; frame-src 'self'; "
                + "manifest-src 'self'; media-src 'self'; object-src 'self'; worker-src 'self'; "
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
            "default-src 'self'; script-src 'self' http://localhost:8180; "
                + "style-src 'self'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' http://localhost:8180; frame-src 'self' http://localhost:8180; "
                + "manifest-src 'self'; media-src 'self'; object-src 'self'; worker-src 'self'; "
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
            "default-src 'self'; script-src 'self' http://localhost:8180; "
                + "style-src 'self'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' http://localhost:8180; frame-src 'self' http://localhost:8180; "
                + "manifest-src 'self'; media-src 'self'; object-src 'self'; worker-src 'self'; "
                + "frame-ancestors 'none'");
    }

    @Test
    public void shouldSetHeaderWithOidcProvider() throws Exception {
        // given
        AuthenticationConfiguration authConfig = AuthenticationConfiguration.getConfiguration(servletContext);
        when(servletContext.getAttribute(AuthenticationConfiguration.AUTHENTICATION_CONFIGURATION)).thenReturn(authConfig);
        when(configManager.get(AuthenticationConfiguration.OIDC_CLIENT_CONFIG))
                .thenReturn(Optional.ofNullable(oidcConfigFile));
        authConfig.configureOidc();
        contentSecurityPolicyFilter.init(filterConfig);
        // when
        contentSecurityPolicyFilter.addHeaders(request, response);
        // then
        verify(response).addHeader("Content-Security-Policy",
            "default-src 'self'; script-src 'self' https://login.microsoftonline.com; "
                + "style-src 'self'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self' https://login.microsoftonline.com; frame-src 'self' https://login.microsoftonline.com; "
                + "manifest-src 'self'; media-src 'self'; object-src 'self'; worker-src 'self'; "
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
            "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self' data:; "
                    + "img-src 'self' data:; connect-src 'self'; frame-src 'self'; "
                    + "manifest-src 'self'; media-src 'self'; object-src 'self'; worker-src 'self'; "
                    + "frame-ancestors 'none'"));
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
            "default-src 'self'; script-src 'self'; "
                + "style-src 'self'; font-src 'self' data:; img-src 'self' data:; "
                + "connect-src 'self'; frame-src 'self'; "
                + "manifest-src 'self'; media-src 'self'; object-src 'self'; worker-src 'self'; "
                + "frame-ancestors 'self'");
    }
}
