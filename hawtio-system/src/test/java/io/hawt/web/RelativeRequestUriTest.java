package io.hawt.web;

import javax.servlet.http.HttpServletRequest;

import io.hawt.web.auth.RelativeRequestUri;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

@RunWith(Parameterized.class)
public class RelativeRequestUriTest {

    @Parameters
    public static Object[][] params() {
        return new Object[][] { // @formatter:off
            { "", 0, "",        "",        "",      new String[0] },
            { "", 1, "",        "",        "",      new String[0] },
            { "", 0, "/",       "",        "",      new String[0] },
            { "", 1, "/",       "",        "",      new String[0] },
            { "", 0, "/a",      "/",       "a",     new String[] { "a" } },
            { "", 0, "/a/b",    "/",       "a/b",   new String[] { "a", "b" } },
            { "", 1, "/a",      "/a",      "",      new String[0] },
            { "", 1, "/a/b",    "/a/",     "b",     new String[] { "b" } },
            { "", 2, "/a/b",    "/a/b",    "",      new String[0] },
            { "", 0, "/a/b/c",  "/",       "a/b/c", new String[] { "a", "b", "c"} },
            { "", 1, "/a/b/c",  "/a/",     "b/c",   new String[] { "b", "c"} },
            { "", 2, "/a/b/c",  "/a/b/",   "c",     new String[] { "c" } },
            { "", 3, "/a/b/c",  "/a/b/c",  "",      new String[0] },
            { "/a", 0, "",       "",       "",      new String[0] },
            { "/a", 1, "",       "",       "",      new String[0] },
            { "/a", 0, "/",      "",       "",      new String[0] },
            { "/a", 1, "/",      "",       "",      new String[0] },
            { "/a", 0, "/a",     "/a",     "",      new String[0] },
            { "/a", 0, "/a/b",   "/a/",    "b",     new String[] { "b" } },
            { "/a", 1, "/a",     "/a",     "",      new String[0] },
            { "/a", 1, "/a/b",   "/a/b",   "",      new String[0] },
            { "/a", 2, "/a/b",   "/a/b",   "",      new String[0] },
            { "/a", 0, "/a/b/c", "/a/",    "b/c",   new String[] { "b", "c" } },
            { "/a", 1, "/a/b/c", "/a/b/",  "c",     new String[] { "c" } },
            { "/a", 2, "/a/b/c", "/a/b/c", "",      new String[0] },
            { "/a", 3, "/a/b/c", "/a/b/c", "",      new String[0] },
        }; // @formatter:on
    }

    @Mock
    private HttpServletRequest request;

    private final String contextPath;
    private final int pathIndex;
    private final String requestUri;
    private final String expectedPrefix;
    private final String expectedUri;
    private final String[] expectedComponents;
    private final String expectedLastComponent;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        Mockito.when(request.getContextPath()).thenReturn(contextPath);
        Mockito.when(request.getRequestURI()).thenReturn(requestUri);
    }

    public RelativeRequestUriTest(final String contextPath, final int pathIndex,
                                  final String requestUri, final String expectedPrefix,
                                  final String expectedUri, final String[] expectedComponents) {
        this.contextPath = contextPath;
        this.pathIndex = pathIndex;
        this.requestUri = requestUri;
        this.expectedPrefix = expectedPrefix;
        this.expectedUri = expectedUri;
        this.expectedComponents = expectedComponents;
        this.expectedLastComponent = expectedComponents.length == 0 ? null
            : expectedComponents[expectedComponents.length - 1];
    }

    @Test
    public void test() {
        final RelativeRequestUri underTest = new RelativeRequestUri(request,
                                                                    pathIndex);
        Assert.assertEquals(expectedPrefix, underTest.getPrefix());
        Assert.assertEquals(expectedUri, underTest.getUri());
        Assert.assertEquals(expectedUri, underTest.toString());
        Assert.assertArrayEquals(expectedComponents, underTest.getComponents());
        Assert.assertEquals(expectedLastComponent, underTest.getLastComponent());
    }

}
