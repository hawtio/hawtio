package io.hawt.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Stream;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import static io.hawt.web.ServletHelpers.HEADER_HAWTIO_FORBIDDEN_REASON;
import static io.hawt.web.auth.SessionExpiryFilter.SERVLET_PATH;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ServletHelpersTest {

    @Test
    public void readObject() throws Exception {
        String data = "{ string: 'text', number: 2, boolean: true }";
        JSONObject json = ServletHelpers.readObject(
            new BufferedReader(new InputStreamReader(new ByteArrayInputStream(data.getBytes()))));
        assertThat(json.get("string"), equalTo("text"));
        assertThat(json.get("number"), equalTo(2));
        assertThat(json.get("boolean"), equalTo(true));
    }

    @Test
    public void writeEmpty() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ServletHelpers.writeEmpty(new PrintWriter(out));
        assertThat(out.toString(), equalTo("{}"));
    }

    @Test
    public void writeObjectAsJson() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        ServletHelpers.writeObjectAsJson(new PrintWriter(out), Collections.emptyList());
        assertThat(out.toString(), equalTo("[]"));

        out.reset();
        Object obj = Map.of("string", "text", "number", 2, "boolean", true);
        ServletHelpers.writeObjectAsJson(new PrintWriter(out), obj);
        assertThat(out.toString(), equalTo("{\"number\":2,\"boolean\":true,\"string\":\"text\"}"));
    }

    @Test
    public void testDoForbiddenResponseWithCustomReason() throws IOException {
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletHelpers.doForbidden(httpResponse, ForbiddenReason.HOST_NOT_ALLOWED);
        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentLength(0);
        verify(httpResponse).setHeader(HEADER_HAWTIO_FORBIDDEN_REASON, ForbiddenReason.HOST_NOT_ALLOWED.name());
        verify(httpResponse).flushBuffer();
    }

    @Test
    public void testDoForbidden() throws IOException {
        HttpServletResponse httpResponse = mock(HttpServletResponse.class);
        ServletHelpers.doForbidden(httpResponse);
        verify(httpResponse).setStatus(HttpServletResponse.SC_FORBIDDEN);
        verify(httpResponse).setContentLength(0);
        verify(httpResponse).setHeader(HEADER_HAWTIO_FORBIDDEN_REASON, ForbiddenReason.NONE.name());
        verify(httpResponse).flushBuffer();
    }

    public static class CleanPathTest {

        public static Stream<Arguments> params() {
            return Stream.of(
                    arguments("", ""),
                    arguments("  ", "  "),
                    arguments("/", "/"),
                    arguments("a", "a"),
                    arguments("/a", "/a"),
                    arguments("a/", "a"),
                    arguments("/a/", "/a"),
                    arguments("//a/", "/a"),
                    arguments("/a//", "/a"),
                    arguments("//a//", "/a"),
                    arguments("/a/b/", "/a/b"),
                    arguments("/a///b/", "/a/b")
            );
        }

        @ParameterizedTest
        @MethodSource("params")
        public void test(String input, String expected) {
            assertThat(ServletHelpers.cleanPath(input), equalTo(expected));
        }
    }

    public static class WebContextPathFromSingleComponentTest {

        public static Stream<Arguments> params() {
            return Stream.of(
                    arguments(null, ""),
                    arguments("", ""),
                    arguments(" ", "/ "),
                    arguments("/", ""),
                    arguments("a", "/a"),
                    arguments("/a", "/a"),
                    arguments("a/", "/a"),
                    arguments("/a/", "/a"),
                    arguments("//a/", "/a"),
                    arguments("/a//", "/a"),
                    arguments("//a//", "/a"),
                    arguments("/a/b/", "/a/b"),
                    arguments("/a///b/", "/a/b")
            );
        }

        @ParameterizedTest
        @MethodSource("params")
        public void test(String input, String expected) {
            assertThat(ServletHelpers.webContextPath((input)), equalTo(expected));
        }
    }

    public static class WebContextPathFromMultipleComponentsTest {

        public static class Parameters {
            private final String input;
            private final String expected;
            private final String more;

            private Parameters(String input, String more, String expected) {
                this.input = input;
                this.expected = expected;
                this.more = more;
            }

            public Parameters(String input, String expected) {
                this.input = input;
                this.expected = expected;
                this.more = null;
            }
        }

        public static Stream<Parameters> params() {
            return Stream.of(
                    new Parameters(null, ""),
                    new Parameters("", ""),
                    new Parameters(" ", "/ "),
                    new Parameters("/", ""),
                    new Parameters("a", "/a"),
                    new Parameters("/a", "/a"),
                    new Parameters("a/", "/a"),
                    new Parameters("/a/", "/a"),
                    new Parameters("//a/", "/a"),
                    new Parameters("/a//", "/a"),
                    new Parameters("//a//", "/a"),
                    new Parameters(null, null, ""),
                    new Parameters(null, "a", "/a"),
                    new Parameters("a", null, "/a"),
                    new Parameters("a", "b", "/a/b"),
                    new Parameters("/a", "b", "/a/b"),
                    new Parameters("a", "/b", "/a/b"),
                    new Parameters("/a", "/b", "/a/b"),
                    new Parameters("/a/", "b", "/a/b"),
                    new Parameters("/a/", "/b", "/a/b"),
                    new Parameters("/a/", "/b/", "/a/b"),
                    new Parameters("/a//", "/b//", "/a/b")
            );
        }

        @ParameterizedTest
        @MethodSource("params")
        public void test(Parameters args) {
            assertThat(ServletHelpers.webContextPath(args.input, args.more), equalTo(args.expected));
        }
    }

    public static class HawtioPathIndexTest {

        public static Stream<Arguments> params() {
            return Stream.of(
                    // [ SERVLET_PATH attribute, full request URI, expected Hawtio path position ]
                    arguments(null, "/jolokia", 0),
                    arguments(null, "/jolokia/version", 0),
                    arguments("", "/jolokia", 0),
                    arguments("", "/jolokia/version", 0),
                    arguments("/x", "/x/jolokia", 1),
                    arguments("/mgmt/actuator/hawtio", "/mgmt/actuator/hawtio/jolokia", 3)
            );
        }

        @ParameterizedTest
        @MethodSource("params")
        public void test(String servletPathAttribute, String uri, int pathIndex) {
            ServletContext ctx = mock(ServletContext.class);
            if (servletPathAttribute != null) {
                when(ctx.getAttribute(SERVLET_PATH)).thenReturn(servletPathAttribute);
            }
            assertThat(ServletHelpers.hawtioPathIndex(ctx), equalTo(pathIndex));
        }
    }

}
