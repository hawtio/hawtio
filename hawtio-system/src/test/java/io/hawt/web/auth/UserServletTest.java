package io.hawt.web.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

class UserServletTest {

    private UserServlet userServlet;
    private AuthenticationConfiguration authConfiguration;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private ByteArrayOutputStream outputStream;
    private PrintWriter writer;

    @BeforeEach
    void setUp() throws Exception {
        userServlet = new UserServlet();
        authConfiguration = mock(AuthenticationConfiguration.class);
        userServlet.authConfiguration = authConfiguration;

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);

        outputStream = new ByteArrayOutputStream();
        writer = new PrintWriter(outputStream);
        when(response.getWriter()).thenReturn(writer);
    }

    private void doGet() throws IOException {
        userServlet.doGet(request, response);
        writer.flush();
    }

    @Test
    void testDoGetWhenAuthenticationDisabled() throws Exception {
        when(authConfiguration.isEnabled()).thenReturn(false);

        doGet();

        assertThat(outputStream.toString(), equalTo("\"public\"\n"));
    }

    @Test
    void testDoGetWithSpringSecurityWhenUserExists() throws Exception {
        when(authConfiguration.isEnabled()).thenReturn(true);
        when(authConfiguration.isSpringSecurityEnabled()).thenReturn(true);
        when(request.getRemoteUser()).thenReturn("testuser");

        doGet();

        assertThat(outputStream.toString(), equalTo("\"testuser\"\n"));
    }

    @Test
    void testDoGetWithSpringSecurityWhenUserDoesNotExist() throws Exception {
        when(authConfiguration.isEnabled()).thenReturn(true);
        when(authConfiguration.isSpringSecurityEnabled()).thenReturn(true);
        when(request.getRemoteUser()).thenReturn(null);

        userServlet.doGet(request, response);

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(response).setContentLength(0);
        verify(response).flushBuffer();
    }

    @Test
    void testDoGetWhenUserHasDomainPrefix() throws Exception {
        when(authConfiguration.isEnabled()).thenReturn(true);
        when(authConfiguration.isSpringSecurityEnabled()).thenReturn(true);
        when(request.getRemoteUser()).thenReturn("domain\\testuser");

        doGet();

        assertThat(outputStream.toString(), equalTo("\"domain\\\\testuser\"\n"));
    }

    @Test
    void testDoGetWithSessionWhenUserExists() throws Exception {
        HttpSession session = mock(HttpSession.class);
        when(authConfiguration.isEnabled()).thenReturn(true);
        when(authConfiguration.isSpringSecurityEnabled()).thenReturn(false);
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("user")).thenReturn("sessionuser");

        doGet();

        assertThat(outputStream.toString(), equalTo("\"sessionuser\"\n"));
    }

    @Test
    void testDoGetWhenNoSession() throws Exception {
        when(authConfiguration.isEnabled()).thenReturn(true);
        when(authConfiguration.isSpringSecurityEnabled()).thenReturn(false);
        when(request.getSession(false)).thenReturn(null);

        doGet();

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(response).setContentLength(0);
        verify(response).flushBuffer();
    }

    @Test
    void testDoGetWhenSessionExistsButNoUserAttribute() throws Exception {
        HttpSession session = mock(HttpSession.class);
        when(authConfiguration.isEnabled()).thenReturn(true);
        when(authConfiguration.isSpringSecurityEnabled()).thenReturn(false);
        when(request.getSession(false)).thenReturn(session);
        when(session.getAttribute("user")).thenReturn(null);

        doGet();

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(response).setContentLength(0);
        verify(response).flushBuffer();
    }


}
