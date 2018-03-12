package io.hawt.web;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.concurrent.TimeUnit;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hamcrest.CoreMatchers;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import io.hawt.system.ConfigManager;

@RunWith(Enclosed.class)
public abstract class SessionExpiryFilterTest {

    private static class TestBase {

        @Mock
        protected ConfigManager cfg;

        @Mock
        protected FilterConfig filterCfg;

        @Mock
        protected FilterChain filterChain;

        @Mock
        protected ServletContext ctx;

        protected SessionExpiryFilter underTest = new SessionExpiryFilter();

        @Before
        public void setUp() {
            MockitoAnnotations.initMocks(this);
            System.clearProperty("hawtio.noCredentials401");
        }

        @After
        public void tearDown() {
            System.clearProperty("hawtio.noCredentials401");
        }

        protected void init(final String contextPath, final String hawtioPath)
                throws ServletException {
            when(ctx.getContextPath()).thenReturn(contextPath);

            when(ctx.getAttribute("hawtioServletPath")).thenReturn(hawtioPath);
            when(ctx.getAttribute("ConfigManager")).thenReturn(cfg);
            when(filterCfg.getServletContext()).thenReturn(ctx);

            underTest.init(filterCfg);
        }

        protected void verifyInit() {
            verify(cfg).get("noCredentials401", "false");
            verify(ctx).getAttribute("hawtioServletPath");
            verify(ctx).getAttribute("ConfigManager");
            verify(filterCfg, atLeast(0)).getServletContext();
            verify(ctx, atLeastOnce()).getAttribute("authenticationEnabled");
        }

    }

    private static abstract class HttpRequestTestBase extends TestBase {

        protected static final String OK = new String("OK");

        @Mock
        protected HttpServletRequest req;

        @Mock
        protected HttpServletResponse res;

        @Mock
        protected HttpSession session;

        private long startTime;

        @Before
        public void setUp() {
            super.setUp();
            this.startTime = System.currentTimeMillis();
        }

        @Override
        protected void init(final String contextPath, final String hawtioPath)
                throws ServletException {
            super.init(contextPath, hawtioPath);
            when(req.getContextPath()).thenReturn(contextPath);
        }

        protected void verifyRequestProcessed() throws Exception {
            verify(req).getSession(false);
            verify(req, atLeastOnce()).getContextPath();
            verify(req, atLeastOnce()).getRequestURI();
        }

        protected void verifyLastAccessUpdated() throws Exception {
            final ArgumentCaptor<Object> argCaptor = ArgumentCaptor
                    .forClass(Object.class);
            verify(session).setAttribute(eq("LastAccess"), argCaptor.capture());

            Assert.assertThat(argCaptor.getValue(),
                    CoreMatchers.instanceOf(Number.class));

            final long value = (Long) argCaptor.getValue();
            Assert.assertTrue(value <= System.currentTimeMillis());
            Assert.assertTrue(value >= startTime);
        }

        protected void verifyFilterChainInvoked() throws Exception {
            verify(filterChain).doFilter(req, res);
        }

        protected void verifySessionInvalidated() throws Exception {
            verify(session).invalidate();
        }

        protected void verifyForbiddenResponseReturned() throws Exception {
            verify(res).setStatus(HttpServletResponse.SC_FORBIDDEN);
            verify(res).setContentLength(0);
            verify(res).flushBuffer();
        }
    }

    public static class NotInitializedTest extends HttpRequestTestBase {

        @Test
        public void testContextNotInitialized() throws Exception {
            underTest.doFilter(req, res, filterChain);

            verify(filterChain).doFilter(req, res);
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

        @Test
        public void testAuthenticationFilterNotInitialized() throws Exception {
            init("", "");

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verify(filterChain).doFilter(req, res);
            verify(ctx).getAttribute("authenticationEnabled");
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }
    }

    @RunWith(Parameterized.class)
    public static class TopLevelRequestTest extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "" },
                { "", "", "" },
                { "", "/", "" },
                { "/a", "", "" },
                { "/a", "", "/a" },
                { "/a", "b", "/b/c" },
                { "/a/b/", "c/d", "/a/b/c/d" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public TopLevelRequestTest(final String contextPath, final String hawtioPath,
                final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        @Test
        public void testNewSession() throws Exception {
            when(req.getRequestURI()).thenReturn(requestUri);
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verifyFilterChainInvoked();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

        @Test
        public void testExistingSession() throws Exception {
            when(req.getRequestURI()).thenReturn(requestUri);
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getSession(false)).thenReturn(session);

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verifyLastAccessUpdated();
            verifyFilterChainInvoked();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }
    }

    @RunWith(Parameterized.class)
    public static class RefreshRequestTest extends HttpRequestTestBase {

        @Mock
        private ServletOutputStream out;

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "/refresh" },
                { "", "", "/refresh" },
                { "", "/", "/refresh" },
                { "/a", "", "/a/refresh" },
                { "/a", "b", "/a/b/refresh" },
                { "/a/b/", "c/d", "/a/b/c/d/refresh" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public RefreshRequestTest(final String contextPath, final String hawtioPath,
                final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        protected void verifyOkWritten() throws Exception {
            verify(res).getOutputStream();
            verify(res).setContentType("text/html;charset=UTF-8");

            final InOrder inOrder = Mockito.inOrder(out);
            inOrder.verify(out).write("ok".getBytes());
            inOrder.verify(out).flush();
            inOrder.verify(out).close();
        }

        @Test
        public void testExpiredSessionShouldBeInvalidatedAndForbiddenResponseReturned()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getSession(false)).thenReturn(session);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(session, Mockito.atLeastOnce()).getMaxInactiveInterval();
            verify(session, Mockito.atLeastOnce()).getAttribute("LastAccess");

            verifySessionInvalidated();
            verifyForbiddenResponseReturned();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session, out);
        }

        @Test
        public void testNonExpiredSessionShouldUpdateLastAccessTimeUpdatedWriteOk()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getSession(false)).thenReturn(session);
            when(res.getOutputStream()).thenReturn(out);
            when(session.getMaxInactiveInterval()).thenReturn(10);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(session, Mockito.atLeastOnce()).getMaxInactiveInterval();
            verify(session, Mockito.atLeastOnce()).getAttribute("LastAccess");

            verifyLastAccessUpdated();
            verifyOkWritten();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session, out);
        }

        @Test
        public void testNoSessionWithoutAuthentificationShouldWriteOk()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(false);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(res.getOutputStream()).thenReturn(out);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verifyOkWritten();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session, out);
        }

        @Test
        public void testNonExpiringSessionWithoutAuthentificationShouldWriteOk()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(false);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getSession(false)).thenReturn(session);
            when(res.getOutputStream()).thenReturn(out);
            when(session.getMaxInactiveInterval()).thenReturn(-1);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(session, Mockito.atLeastOnce()).getMaxInactiveInterval();
            verifyOkWritten();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session, out);
        }
    }

    @RunWith(Parameterized.class)
    public static class SubContextRequestWithExpiringSessionTest
            extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "/foo" },
                { "", "", "/foo" },
                { "", "/", "/foo" },
                { "/a", "", "/a/foo" },
                { "/a", "b", "/a/b/foo" },
                { "/a/b/", "c/d", "/a/b/c/d/foo" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public SubContextRequestWithExpiringSessionTest(final String contextPath,
                final String hawtioPath, final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        @Test
        public void testShouldInvalidateExpiredSessionAndReturnForbiddenResponse()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getSession(false)).thenReturn(session);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(session, Mockito.atLeastOnce()).getMaxInactiveInterval();
            verify(session, Mockito.atLeastOnce()).getAttribute("LastAccess");

            verifySessionInvalidated();
            verifyForbiddenResponseReturned();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

        @Test
        public void testShouldProceedIfSessionIsNotExpired() throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getSession(false)).thenReturn(session);
            when(session.getMaxInactiveInterval()).thenReturn(10);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(session, Mockito.atLeastOnce()).getMaxInactiveInterval();
            verify(session, Mockito.atLeastOnce()).getAttribute("LastAccess");

            verifyLastAccessUpdated();
            verifyFilterChainInvoked();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }
    }

    @RunWith(Parameterized.class)
    public static class IgnoredSubContextRequestTest extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "/jolokia" },
                { "", null, "/proxy" },
                { "", "", "/jolokia" },
                { "", "", "/proxy" },
                { "", "/", "/proxy" },
                { "", "/", "/proxy" },
                { "/a", "", "/a/jolokia" },
                { "/a", "", "/a/proxy" },
                { "/a", "b", "/a/b/jolokia" },
                { "/a", "b", "/a/b/proxy" },
                { "/a/b/", "a/b", "/a/b/c/d/jolokia" },
                { "/a/b/", "a/b", "/a/b/c/d/proxy" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public IgnoredSubContextRequestTest(final String contextPath,
                final String hawtioPath, final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        @Test
        public void testShouldProceedWithoutUpdatingLastAccess() throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getSession(false)).thenReturn(session);
            when(session.getMaxInactiveInterval()).thenReturn(10);
            when(session.getAttribute("LastAccess")).thenReturn(
                    System.currentTimeMillis() - TimeUnit.SECONDS.toMillis(1));

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(session, Mockito.atLeastOnce()).getMaxInactiveInterval();
            verify(session, Mockito.atLeastOnce()).getAttribute("LastAccess");

            verifyFilterChainInvoked();

            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }
    }

    @RunWith(Parameterized.class)
    public static class SubContextRequestTest extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "/foo" },
                { "", "", "/foo" },
                { "", "/", "/foo" },
                { "/a", "", "/a/foo" },
                { "/a", "b", "/a/b/foo" },
                { "/a/b/", "c/d", "/a/b/c/d/foo" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public SubContextRequestTest(final String contextPath,
                final String hawtioPath, final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        @Test
        public void testShouldProceedIfAuthenticationIsDisabled() throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(false);
            when(req.getRequestURI()).thenReturn(requestUri);

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verifyFilterChainInvoked();
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

        @Test
        public void testShouldProceedIfAuthenticationIsEnabledAndRequestHasAuthorizationHeader()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);
            when(req.getHeader("Authorization")).thenReturn("");

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(req).getHeader("Authorization");
            verifyFilterChainInvoked();
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

        @Test
        public void testUnauthorisedRequestShouldProceedForInsensitiveSubContext()
                throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(req).getHeader("Authorization");
            verifyFilterChainInvoked();
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

    }

    @RunWith(Parameterized.class)
    public static class NoCredentials401JolokiaRequestTest
            extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "/jolokia" },
                { "", "", "/jolokia" },
                { "", "/", "/jolokia" },
                { "/a", "", "/a/jolokia" },
                { "/a", "b", "/a/b/jolokia" },
                { "/a/b/", "c/d", "/a/b/c/d/jolokia" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public NoCredentials401JolokiaRequestTest(final String contextPath,
                final String hawtioPath, final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        @Test
        public void testShouldProceedIfAuthenticationIsDisabled() throws Exception {
            System.setProperty("hawtio.noCredentials401", "true");

            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(req).getHeader("Authorization");
            verifyFilterChainInvoked();
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }

    }

    @RunWith(Parameterized.class)
    public static class UnauthorizedSensitiveSubContextRequestTest
            extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "/jolokia" },
                { "", "", "/proxy" },
                { "", "/", "/user" },
                { "/a", "", "/a/exportContext" },
                { "/a", "b", "/a/b/contextFormatter" },
                { "/a/b/", "c/d", "/a/b/c/d/upload" },
            }; // @formatter:on
        }

        protected final String contextPath;
        protected final String hawtioPath;
        protected final String requestUri;

        public UnauthorizedSensitiveSubContextRequestTest(final String contextPath,
                final String hawtioPath, final String requestUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;
            this.requestUri = requestUri;
        }

        @Test
        public void testShouldReturnForbiddenResponse() throws Exception {
            when(ctx.getAttribute("authenticationEnabled")).thenReturn(true);
            when(req.getRequestURI()).thenReturn(requestUri);

            init(contextPath, hawtioPath);

            underTest.doFilter(req, res, filterChain);

            verifyInit();
            verifyRequestProcessed();
            verify(req).getHeader("Authorization");
            verifyForbiddenResponseReturned();
            verifyNoMoreInteractions(cfg, filterCfg, ctx, req, res, session);
        }
    }
}
