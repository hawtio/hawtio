package io.hawt.web;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

@RunWith(Enclosed.class)
public abstract class RedirectFilterTest {

    private static abstract class TestBase {

        @Mock
        protected FilterConfig filterCfg;

        @Mock
        protected FilterChain filterChain;

        @Mock
        protected ServletContext ctx;

        protected RedirectFilter underTest = new RedirectFilter();

        @Before
        public void setUp() {
            MockitoAnnotations.initMocks(this);
        }

        protected void init(final String contextPath, final String hawtioPath)
                throws ServletException {
            Mockito.when(ctx.getContextPath()).thenReturn(contextPath);
            Mockito.when(filterCfg.getServletContext()).thenReturn(ctx);
            initConfigManager(hawtioPath);

            underTest.init(filterCfg);
        }

        protected void initConfigManager(final String hawtioPath) {
            Mockito.when(ctx.getAttribute("hawtioServletPath"))
                    .thenReturn(hawtioPath);
        }

        protected void verifyInit() {
            Mockito.verify(this.filterCfg, Mockito.atLeast(0)).getServletContext();
            Mockito.verify(this.filterCfg).getInitParameter("allowedContexts");
            Mockito.verify(this.ctx).getAttribute("hawtioServletPath");
        }
    }

    @RunWith(Parameterized.class)
    private static abstract class HttpRequestTestBase extends TestBase {

        protected static final String OK = new String("OK");

        @Mock
        private HttpServletRequest req;

        @Mock
        private HttpServletResponse res;

        private final String contextPath;
        private final String hawtioPath;
        private final String requestUri;
        private final String queryString;
        private final String expectedUri;

        protected HttpRequestTestBase(final String contextPath,
                final String hawtioPath, final String requestUri,
                final String expectedUri) {
            this.contextPath = contextPath;
            this.hawtioPath = hawtioPath;

            final int queryStart = requestUri.indexOf('?');
            if (queryStart == -1) {
                this.requestUri = requestUri;
                this.queryString = null;
            } else {
                this.requestUri = requestUri.substring(0, queryStart);
                this.queryString = requestUri.substring(queryStart + 1);
            }
            this.expectedUri = expectedUri;
        }

        @Test
        public void test() throws Exception {
            init(this.contextPath, this.hawtioPath);
            Mockito.when(req.getContextPath()).thenReturn(contextPath);
            Mockito.when(req.getRequestURI()).thenReturn(this.requestUri);
            Mockito.when(req.getQueryString()).thenReturn(this.queryString);

            underTest.doFilter(req, res, filterChain);

            verifyInit();

            if (expectedUri == OK) {
                Mockito.verify(filterChain).doFilter(req, res);
            } else {
                Mockito.verify(res).sendRedirect(this.expectedUri);
            }
        }
    }

    public static class WithoutConfigManagerHttpRequestTest
            extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", "", OK},
                { "", "/", OK},
                { "", "/index.html", OK },
                { "", "/foo.bar", OK },
                { "", "/auth", OK },
                { "", "/jolokia", OK },
                { "", "/plugin", OK },
                { "", "/?", OK },
                { "", "/foo", "/#/foo" },
                { "", "/foo?bar=foobar", "/#/foo?bar=foobar" },
                { "/a", "", OK},
                { "/a", "/", OK},
                { "/a", "/a", OK},
                { "/a", "/a/", OK},
                { "/a", "/a/index.html", OK },
                { "/a", "/a/foo.bar", OK },
                { "/a", "/a/auth", OK },
                { "/a", "/a/jolokia", OK },
                { "/a", "/a/plugin", OK },
                { "/a", "/a/?", OK },
                { "/a", "/a/foo", "/a/#/foo" },
                { "/a", "/a/foo?bar=foobar", "/a/#/foo?bar=foobar" },
                { "/a/b", "", OK},
                { "/a/b", "/", OK},
                { "/a/b", "/a/b", OK},
                { "/a/b", "/a/b/", OK},
                { "/a/b", "/a/b/index.html", OK },
                { "/a/b", "/a/b/foo.bar", OK },
                { "/a/b", "/a/b/auth", OK },
                { "/a/b", "/a/b/jolokia", OK },
                { "/a/b", "/a/b/plugin", OK },
                { "/a/b", "/a/b/?", OK },
                { "/a/b", "/a/b/foo", "/a/b/#/foo" },
                { "/a/b", "/a/b/foo?bar=foobar", "/a/b/#/foo?bar=foobar" },
            }; // @formatter:on
        }

        @Override
        protected void initConfigManager(final String hawtioPath) {
            // noop
        }

        public WithoutConfigManagerHttpRequestTest(final String contextPath,
                final String requestUri, final String expectedUri) {
            super(contextPath, null, requestUri, expectedUri);
        }

    }

    public static class WithConfigManagerHttpRequestTest
            extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "", OK},
                { "", null, "/", OK},
                { "", null, "/index.html", OK },
                { "", null, "/foo.bar", OK },
                { "", null, "/auth", OK },
                { "", null, "/jolokia", OK },
                { "", null, "/plugin", OK },
                { "", null, "/?", OK },
                { "", null, "/foo", "/#/foo" },
                { "", null, "/foo?bar=foobar", "/#/foo?bar=foobar" },
                { "/a", null, "", OK},
                { "/a", null, "/", OK},
                { "/a", null, "/a", OK},
                { "/a", null, "/a/", OK},
                { "/a", null, "/a/index.html", OK },
                { "/a", null, "/a/foo.bar", OK },
                { "/a", null, "/a/auth", OK },
                { "/a", null, "/a/jolokia", OK },
                { "/a", null, "/a/plugin", OK },
                { "/a", null, "/a/?", OK },
                { "/a", null, "/a/foo", "/a/#/foo" },
                { "/a", null, "/a/foo?bar=foobar", "/a/#/foo?bar=foobar" },
                { "", "a", "", OK},
                { "", "a", "/", OK},
                { "", "a", "/a", OK},
                { "", "a", "/a/", OK},
                { "", "a", "/a/index.html", OK },
                { "", "a", "/a/foo.bar", OK },
                { "", "a", "/a/auth", OK },
                { "", "a", "/a/jolokia", OK },
                { "", "a", "/a/plugin", OK },
                { "", "a", "/a/?", OK },
                { "", "a", "/a/foo", "/a/#/foo" },
                { "", "a", "/a/foo?bar=foobar", "/a/#/foo?bar=foobar" },
                { "", "a/b", "", OK},
                { "", "a/b", "/", OK},
                { "", "a/b", "/a/b", OK},
                { "", "a/b", "/a/b/", OK},
                { "", "a/b", "/a/b/index.html", OK },
                { "", "a/b", "/a/b/foo.bar", OK },
                { "", "a/b", "/a/b/auth", OK },
                { "", "a/b", "/a/b/jolokia", OK },
                { "", "a/b", "/a/b/plugin", OK },
                { "", "a/b", "/a/b/?", OK },
                { "", "a/b", "/a/b/foo", "/a/b/#/foo" },
                { "", "a/b", "/a/b/foo?bar=foobar", "/a/b/#/foo?bar=foobar" },
                { "/a", "b/c", "", OK},
                { "/a", "b/c", "/", OK},
                { "/a", "b/c", "/a/b/c", OK},
                { "/a", "b/c", "/a/b/c/", OK},
                { "/a", "b/c", "/a/b/c/index.html", OK },
                { "/a", "b/c", "/a/b/c/foo.bar", OK },
                { "/a", "b/c", "/a/b/c/auth", OK },
                { "/a", "b/c", "/a/b/c/jolokia", OK },
                { "/a", "b/c", "/a/b/c/plugin", OK },
                { "/a", "b/c", "/a/b/c/?", OK },
                { "/a", "b/c", "/a/b/c/foo", "/a/b/c/#/foo" },
                { "/a", "b/c", "/a/b/c/foo?bar=foobar", "/a/b/c/#/foo?bar=foobar" },
            }; // @formatter:on
        }

        public WithConfigManagerHttpRequestTest(final String contextPath,
                final String hawtioPath, final String requestUri,
                final String expectedUri) {
            super(contextPath, hawtioPath, requestUri, expectedUri);
        }

    }

    public static class WithConfigManagerAndAdditionalAllowedContextsHttpRequestTest
            extends HttpRequestTestBase {

        @Parameters
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "", null, "", OK},
                { "", null, "/", OK},
                { "", null, "/index.html", OK },
                { "", null, "/foo.bar", OK },
                { "", null, "/auth", OK },
                { "", null, "/jolokia", OK },
                { "", null, "/plugin", OK },
                { "", null, "/?", OK },
                { "", null, "/foo", OK },
                { "", null, "/bar", OK },
                { "", null, "/foo?bar=foobar", OK },
                { "", null, "/foobar", "/#/foobar" },
                { "/a", null, "", OK},
                { "/a", null, "/", OK},
                { "/a", null, "/a", OK},
                { "/a", null, "/a/", OK},
                { "/a", null, "/a/index.html", OK },
                { "/a", null, "/a/foo.bar", OK },
                { "/a", null, "/a/auth", OK },
                { "/a", null, "/a/jolokia", OK },
                { "/a", null, "/a/plugin", OK },
                { "/a", null, "/a/?", OK },
                { "/a", null, "/a/foo", OK },
                { "/a", null, "/a/bar", OK },
                { "/a", null, "/a/foo?bar=foobar", OK },
                { "/a", null, "/a/foobar", "/a/#/foobar" },
                { "", "a", "", OK},
                { "", "a", "/", OK},
                { "", "a", "/a", OK},
                { "", "a", "/a/", OK},
                { "", "a", "/a/index.html", OK },
                { "", "a", "/a/foo.bar", OK },
                { "", "a", "/a/auth", OK },
                { "", "a", "/a/jolokia", OK },
                { "", "a", "/a/plugin", OK },
                { "", "a", "/a/?", OK },
                { "", "a", "/a/foo", OK },
                { "", "a", "/a/bar", OK },
                { "", "a", "/a/foo?bar=foobar", OK },
                { "", "a", "/a/foobar", "/a/#/foobar" },
                { "", "a/b", "", OK},
                { "", "a/b", "/", OK},
                { "", "a/b", "/a/b", OK},
                { "", "a/b", "/a/b/", OK},
                { "", "a/b", "/a/b/index.html", OK },
                { "", "a/b", "/a/b/foo.bar", OK },
                { "", "a/b", "/a/b/auth", OK },
                { "", "a/b", "/a/b/jolokia", OK },
                { "", "a/b", "/a/b/plugin", OK },
                { "", "a/b", "/a/b/?", OK },
                { "", "a/b", "/a/b/foo", OK },
                { "", "a/b", "/a/b/bar", OK },
                { "", "a/b", "/a/b/foo?bar=foobar", OK },
                { "", "a/b", "/a/b/foobar", "/a/b/#/foobar" },
                { "/a", "b/c", "", OK},
                { "/a", "b/c", "/", OK},
                { "/a", "b/c", "/a/b/c", OK},
                { "/a", "b/c", "/a/b/c/", OK},
                { "/a", "b/c", "/a/b/c/index.html", OK },
                { "/a", "b/c", "/a/b/c/foo.bar", OK },
                { "/a", "b/c", "/a/b/c/auth", OK },
                { "/a", "b/c", "/a/b/c/jolokia", OK },
                { "/a", "b/c", "/a/b/c/plugin", OK },
                { "/a", "b/c", "/a/b/c/?", OK },
                { "/a", "b/c", "/a/b/c/foo", OK },
                { "/a", "b/c", "/a/b/c/bar", OK },
                { "/a", "b/c", "/a/b/c/foo?bar=foobar", OK },
                { "/a", "b/c", "/a/b/c/foobar", "/a/b/c/#/foobar" },
            }; // @formatter:on
        }

        public WithConfigManagerAndAdditionalAllowedContextsHttpRequestTest(
                final String contextPath, final String hawtioPath,
                final String requestUri, final String expectedUri) {
            super(contextPath, hawtioPath, requestUri, expectedUri);
        }

        @Override
        protected void init(final String contextPath, final String hawtioPath)
                throws ServletException {
            Mockito.when(filterCfg.getInitParameter("allowedContexts"))
                    .thenReturn(" foo , /bar ");
            super.init(contextPath, hawtioPath);
        }
    }

    public static class NonHttpRequestTest extends TestBase {

        private void test(final ServletRequest req, final ServletResponse res)
                throws Exception {
            init("", null);
            underTest.doFilter(req, res, filterChain);

            verifyInit();

            Mockito.verify(filterChain).doFilter(req, res);
            Mockito.verifyNoMoreInteractions(filterCfg, filterChain, req, res);
        }

        @Test
        public void testRequestAndResponseAreNonHttp() throws Exception {
            test(Mockito.mock(ServletRequest.class),
                    Mockito.mock(ServletResponse.class));
        }

        @Test
        public void testRequestIsHttpAndResponseIsNonHttp() throws Exception {
            test(Mockito.mock(HttpServletRequest.class),
                    Mockito.mock(ServletResponse.class));
        }

        @Test
        public void testRequestIsNonHttpAndResponseIsHttp() throws Exception {
            test(Mockito.mock(ServletRequest.class),
                    Mockito.mock(HttpServletResponse.class));
        }
    }
}
