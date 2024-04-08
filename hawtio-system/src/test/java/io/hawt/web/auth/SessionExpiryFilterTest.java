/*
 * Copyright 2024 hawt.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.web.auth;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import io.hawt.system.ConfigManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class SessionExpiryFilterTest {

    private SessionExpiryFilter filter;
    private long now;

    private HttpServletRequest req;
    private HttpServletResponse res;
    private HttpSession session;
    private FilterChain chain;

    private ArgumentCaptor<Long> lastAccessCaptor;
    private ServletOutputStream servletStream;
    private ByteArrayOutputStream responseStream;

    @BeforeEach
    public void init() throws Exception {
        FilterConfig fc = mock(FilterConfig.class);
        ServletContext sc = mock(ServletContext.class);
        when(fc.getServletContext()).thenReturn(sc);
        when(sc.getAttribute(ConfigManager.CONFIG_MANAGER)).thenReturn(new ConfigManager());

        ArgumentCaptor<AuthenticationConfiguration> ac = ArgumentCaptor.forClass(AuthenticationConfiguration.class);
        AuthenticationConfiguration.getConfiguration(sc);
        verify(sc).setAttribute(eq(AuthenticationConfiguration.AUTHENTICATION_CONFIGURATION), ac.capture());
        when(sc.getAttribute(AuthenticationConfiguration.AUTHENTICATION_CONFIGURATION)).thenReturn(ac.getValue());

        when(sc.getAttribute(SessionExpiryFilter.SERVLET_PATH)).thenReturn("/actuator/hawtio");

        filter = new SessionExpiryFilter() {
            @Override
            protected long now() {
                return SessionExpiryFilterTest.this.now;
            }
        };
        filter.init(fc);

        req = mock(HttpServletRequest.class);
        res = mock(HttpServletResponse.class);
        session = mock(HttpSession.class);

        lastAccessCaptor = ArgumentCaptor.forClass(Long.TYPE);

        // by default = no context path (no special server.servlet.context-path or management.server.base-path
        // configuration in application.properties
        when(req.getContextPath()).thenReturn("");

        servletStream = mock(ServletOutputStream.class);
        when(res.getOutputStream()).thenReturn(servletStream);

        chain = mock(FilterChain.class);
    }

    @Test
    public void topLevelNoSession() throws Exception {
        // if there's no session, we simply continue with the chain
        when(req.getSession(false)).thenReturn(null);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio");
        filter.doFilter(req, res, chain);
        verify(chain).doFilter(req, res);
        verify(res, times(0)).getOutputStream();
    }

    @Test
    public void noSession() throws Exception {
        // if there's no session, we simply continue with the chain whatever the URI
        when(req.getSession(false)).thenReturn(null);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/index.html");
        filter.doFilter(req, res, chain);
        verify(chain).doFilter(req, res);
        verify(res, times(0)).getOutputStream();

        reset(chain);
        when(req.getRequestURI()).thenReturn("/actuator/hawtio/favicon.ico");
        filter.doFilter(req, res, chain);
        verify(chain).doFilter(req, res);
        verify(res, times(0)).getOutputStream();

        reset(chain);
        when(req.getRequestURI()).thenReturn("/actuator/hawtio/proxy/http/127.0.0.1/7778/jolokia/");
        filter.doFilter(req, res, chain);
        verify(chain).doFilter(req, res);
        verify(res, times(0)).getOutputStream();
    }

    @Test
    public void topLevelExistingSession() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        now = 42L;

        when(req.getRequestURI()).thenReturn("/actuator/hawtio");
        filter.doFilter(req, res, chain);
        verify(session).setAttribute(eq(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS), lastAccessCaptor.capture());
        verify(chain).doFilter(req, res);
        verify(res, times(0)).getOutputStream();
        assertEquals(42L, lastAccessCaptor.getValue());
    }

    @Test
    public void noSessionTimeout() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        when(session.getMaxInactiveInterval()).thenReturn(-1);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/jolokia");
        filter.doFilter(req, res, chain);
        verify(session, times(0)).setAttribute(anyString(), anyLong());
        verify(chain).doFilter(req, res);
        verify(res, times(0)).getOutputStream();
    }

    @Test
    public void refreshWithNoSession() throws Exception {
        when(req.getSession(false)).thenReturn(null);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/refresh");
        filter.doFilter(req, res, chain);
        verify(session, times(0)).setAttribute(anyString(), anyLong());
        verify(chain, times(0)).doFilter(req, res);
        verify(res, times(1)).getOutputStream();
        verify(servletStream).write("ok".getBytes(StandardCharsets.UTF_8));
        verify(servletStream).flush();
    }

    @Test
    public void refreshWithNoSessionTimeout() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        when(session.getMaxInactiveInterval()).thenReturn(-1);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/refresh");
        filter.doFilter(req, res, chain);
        verify(session, times(0)).setAttribute(anyString(), anyLong());
        verify(chain, times(0)).doFilter(req, res);
        verify(res, times(1)).getOutputStream();
        verify(servletStream).write("ok".getBytes(StandardCharsets.UTF_8));
        verify(servletStream).flush();
    }

    @Test
    public void explicitRefreshSession() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        when(session.getMaxInactiveInterval()).thenReturn(30);
        now = 42000L;
        // just in time...
        when(session.getAttribute(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS)).thenReturn(12000L);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/refresh");
        filter.doFilter(req, res, chain);
        verify(session, times(1)).setAttribute(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS, 42000L);
        verify(chain, times(0)).doFilter(req, res);
        verify(res, times(1)).getOutputStream();
        verify(servletStream).write("ok".getBytes(StandardCharsets.UTF_8));
        verify(servletStream).flush();
    }

    @Test
    public void explicitRefreshSession1SecondTooLate() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        when(session.getMaxInactiveInterval()).thenReturn(30);
        now = 43000L;
        // 1 too late... (expiration is checked per second, not millisecond)
        when(session.getAttribute(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS)).thenReturn(12000L);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/refresh");
        filter.doFilter(req, res, chain);
        verify(session, times(0)).setAttribute(anyString(), anyLong());
        verify(session).invalidate();
        verify(chain, times(0)).doFilter(req, res);
        verify(res).setStatus(403);
    }

    @Test
    public void implicitRefreshSession() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        when(session.getMaxInactiveInterval()).thenReturn(30);
        now = 42000L;
        when(session.getAttribute(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS)).thenReturn(12000L);

        when(req.getRequestURI()).thenReturn("/actuator/hawtio/img/hawtio-logo.svg");
        filter.doFilter(req, res, chain);
        verify(session).setAttribute(eq(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS), lastAccessCaptor.capture());
        verify(chain, times(1)).doFilter(req, res);
        assertEquals(42000L, lastAccessCaptor.getValue());
    }

    @Test
    public void implicitNoSessionRefresh() throws Exception {
        when(req.getSession(false)).thenReturn(session);
        when(session.getMaxInactiveInterval()).thenReturn(30);
        now = 42000L;
        when(session.getAttribute(SessionExpiryFilter.ATTRIBUTE_LAST_ACCESS)).thenReturn(12000L);

        // jolokia and proxy requests do not prolong the session
        when(req.getRequestURI()).thenReturn("/actuator/hawtio/jolokia/version");
        filter.doFilter(req, res, chain);
        verify(session, times(0)).setAttribute(anyString(), anyLong());
        verify(chain, times(1)).doFilter(req, res);
    }

}
