package io.hawt.web.filters;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static io.hawt.web.filters.BaseTagHrefFilter.PARAM_APPLICATION_CONTEXT_PATH;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class BaseTagHrefFilterTest {

    private BaseTagHrefFilter filter;
    private FilterConfig filterConfig;
    private ServletContext servletContext;
    private HttpServletRequest servletRequest;
    private HttpServletResponse servletResponse;
    private ServletOutputStream outputStream;

    @BeforeEach
    public void setUp() {
        filter = new BaseTagHrefFilter();
        filterConfig = mock(FilterConfig.class);
        servletContext = mock(ServletContext.class);
        servletRequest = mock(HttpServletRequest.class);
        servletResponse = mock(HttpServletResponse.class);
        outputStream = mock(ServletOutputStream.class);
    }

    @Test
    public void filterWithDefaultContextPath() throws Exception {
        assertFilteredContentContainsBaseHref("/hawtio", "/hawtio/");
    }

    @Test
    public void filterWithNullContextPath() throws Exception {
        assertFilteredContentContainsBaseHref(null, "/");
    }

    @Test
    public void filterWithEmptyContextPath() throws Exception {
        assertFilteredContentContainsBaseHref("", "/");
    }

    @Test
    public void filterWithCustomContextPaths() throws Exception {
        assertFilteredContentContainsBaseHref("/foo", "/foo/");
        assertFilteredContentContainsBaseHref("/foo/bar", "/foo/bar/");
        assertFilteredContentContainsBaseHref("/foo/bar/cheese", "/foo/bar/cheese/");
    }

    @Test
    public void filterWithSpringBootManagementContextPath() throws Exception {
        assertFilteredContentContainsBaseHref("/management", "text/html; charset=utf-8", "/hawtio", "/hawtio/management/");
    }

    @Test
    public void filterWithCustomContextPathAndContentTypeApplicationJson() throws Exception {
        assertFilteredContentContainsBaseHref(null, "application/json", "/foo", "/hawtio/");
    }

    @Test
    public void filterWithManagementContextPathAndNullContextPath() throws Exception {
        assertFilteredContentContainsBaseHref("/management", "text/html; charset=utf-8", null, "/management/");
    }

    @Test
    public void filterNonHawtioIndex() throws Exception {
        final String originalHtml = readHtml("index2.html");
        final String expectedHtml = originalHtml.replaceAll("/literally-anything", "/special-console");

        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(filterConfig.getInitParameter(PARAM_APPLICATION_CONTEXT_PATH)).thenReturn(null);
        when(servletContext.getContextPath()).thenReturn("/special-console");
        when(servletResponse.getOutputStream()).thenReturn(outputStream);
        when(servletResponse.getContentType()).thenReturn("text/html; charset=utf-8");

        filter.init(filterConfig);
        filter.doFilter(servletRequest, servletResponse, new MockFilterChain("index2.html"));

        verify(outputStream).write(expectedHtml.getBytes(StandardCharsets.UTF_8));
    }

    private void assertFilteredContentContainsBaseHref(String contextPath, String expectedBaseTagHref) throws Exception {
        assertFilteredContentContainsBaseHref(null, "text/html; charset=utf-8", contextPath, expectedBaseTagHref);
    }

    private void assertFilteredContentContainsBaseHref(String applicationContextPath, String contentType, String contextPath, String expectedBaseTagHref) throws Exception {
        assertFilteredContentContainsBaseHref(applicationContextPath, contentType, contextPath, expectedBaseTagHref, "index.html");
    }

    private void assertFilteredContentContainsBaseHref(String applicationContextPath, String contentType, String contextPath, String expectedBaseTagHref, String resource) throws Exception {
        final String originalHtml = readHtml(resource);
        final String expectedHtml = originalHtml.replace("/hawtio/", expectedBaseTagHref);

        when(filterConfig.getServletContext()).thenReturn(servletContext);
        when(filterConfig.getInitParameter(PARAM_APPLICATION_CONTEXT_PATH)).thenReturn(applicationContextPath);
        when(servletContext.getContextPath()).thenReturn(contextPath);
        when(servletResponse.getOutputStream()).thenReturn(outputStream);
        when(servletResponse.getContentType()).thenReturn(contentType);

        filter.init(filterConfig);
        filter.doFilter(servletRequest, servletResponse, new MockFilterChain(resource));

        verify(outputStream).write(expectedHtml.getBytes(StandardCharsets.UTF_8));
    }

    private String readHtml(String resource) throws IOException {
        return IOUtils.toString(
            Objects.requireNonNull(BaseTagHrefFilterTest.class.getResourceAsStream(resource)),
            Charset.defaultCharset());
    }

    private class MockFilterChain implements FilterChain {
        private final String resource;

        private MockFilterChain(String resource) {
            this.resource = resource;
        }

        @Override
        public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse) throws IOException {
            servletResponse.getOutputStream().write(readHtml(resource).getBytes());
        }
    }
}
