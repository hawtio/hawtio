package io.hawt.web;

import java.util.stream.Stream;

import jakarta.servlet.http.HttpServletRequest;

import io.hawt.web.auth.RelativeRequestUri;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;


public class RelativeRequestUriTest {
    public static class Parameters {

        private final String contextPath;
        private final int pathIndex;
        private final String requestUri;
        private final String expectedPrefix;
        private final String expectedUri;
        private final String[] expectedComponents;
        private final String expectedLastComponent;

        private Parameters(final String contextPath, final int pathIndex,
                           final String requestUri, final String expectedPrefix,
                           final String expectedUri, final String[] expectedComponents) {
            this.contextPath = contextPath;
            this.pathIndex = pathIndex;
            this.expectedPrefix = expectedPrefix;
            this.expectedUri = expectedUri;
            this.requestUri = requestUri;
            this.expectedComponents = expectedComponents;
            this.expectedLastComponent = expectedComponents.length == 0 ? null
                : expectedComponents[expectedComponents.length - 1];
        }
    }


    public static Stream<Parameters> params() {
        return Stream.of(
            new Parameters("", 0, "", "", "", new String[0]),
            new Parameters("", 1, "", "", "", new String[0]),
            new Parameters("", 0, "/", "", "", new String[0]),
            new Parameters("", 1, "/", "", "", new String[0]),
            new Parameters("", 0, "/a", "/", "a", new String[] { "a" }),
            new Parameters("", 0, "/a/b", "/", "a/b", new String[] { "a", "b" }),
            new Parameters("", 1, "/a", "/a", "", new String[0]),
            new Parameters("", 1, "/a/b", "/a/", "b", new String[] { "b" }),
            new Parameters("", 2, "/a/b", "/a/b", "", new String[0]),
            new Parameters("", 0, "/a/b/c", "/", "a/b/c", new String[] { "a", "b", "c" }),
            new Parameters("", 1, "/a/b/c", "/a/", "b/c", new String[] { "b", "c" }),
            new Parameters("", 2, "/a/b/c", "/a/b/", "c", new String[] { "c" }),
            new Parameters("", 3, "/a/b/c", "/a/b/c", "", new String[0]),
            new Parameters("/a", 0, "", "", "", new String[0]),
            new Parameters("/a", 1, "", "", "", new String[0]),
            new Parameters("/a", 0, "/", "", "", new String[0]),
            new Parameters("/a", 1, "/", "", "", new String[0]),
            new Parameters("/a", 0, "/a", "/a", "", new String[0]),
            new Parameters("/a", 0, "/a/b", "/a/", "b", new String[] { "b" }),
            new Parameters("/a", 1, "/a", "/a", "", new String[0]),
            new Parameters("/a", 1, "/a/b", "/a/b", "", new String[0]),
            new Parameters("/a", 2, "/a/b", "/a/b", "", new String[0]),
            new Parameters("/a", 0, "/a/b/c", "/a/", "b/c", new String[] { "b", "c" }),
            new Parameters("/a", 1, "/a/b/c", "/a/b/", "c", new String[] { "c" }),
            new Parameters("/a", 2, "/a/b/c", "/a/b/c", "", new String[0]),
            new Parameters("/a", 3, "/a/b/c", "/a/b/c", "", new String[0])
        );
    }

    @Mock
    private HttpServletRequest request;

    @ParameterizedTest
    @MethodSource("params")
    public void test(Parameters args) {
        MockitoAnnotations.openMocks(this);
        Mockito.when(request.getContextPath()).thenReturn(args.contextPath);
        Mockito.when(request.getRequestURI()).thenReturn(args.requestUri);
        final RelativeRequestUri underTest = new RelativeRequestUri(request, args.pathIndex);
        Assertions.assertEquals(args.expectedPrefix, underTest.getPrefix());
        Assertions.assertEquals(args.expectedUri, underTest.getUri());
        Assertions.assertEquals(args.expectedUri, underTest.toString());
        Assertions.assertArrayEquals(args.expectedComponents, underTest.getComponents());
        Assertions.assertEquals(args.expectedLastComponent, underTest.getLastComponent());
    }

}

