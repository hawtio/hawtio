package io.hawt.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.Properties;
import java.util.stream.Stream;

import jakarta.servlet.ServletContext;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import static io.hawt.web.auth.SessionExpiryFilter.SERVLET_PATH;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;


public class StringsTest {

    @Nested
    class SplitTest {

        @Test
        public void split() {
            assertThat(Strings.split("abc", ","), is(Collections.singletonList("abc")));
            assertThat(Strings.split("a,b,c", ","), is(Arrays.asList("a", "b", "c")));
            assertThat(Strings.split("a, b, c", ","), is(Arrays.asList("a", "b", "c")));
            assertThat(Strings.split(",a,,b,,c,", ","), is(Arrays.asList("a", "b", "c")));
            try {
                Strings.split(null, ",");
                fail();
            } catch (IllegalArgumentException e) {
                // success
            }
            try {
                Strings.split("a, b, c", null);
                fail();
            } catch (IllegalArgumentException e) {
                // success
            }
        }
    }

    @Nested
    class PropertiesTest {

        @Test
        public void oneLevelSystemProperties() {
            System.setProperty("hawtio.what", "world");
            assertThat(Strings.resolvePlaceholders(null), nullValue());
            assertThat(Strings.resolvePlaceholders("Hello"), is("Hello"));
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.what}!"), is("Hello world!"));
            assertThat(Strings.resolvePlaceholders("${hawtio.what}"), is("world"));
            assertThat(Strings.resolvePlaceholders("${hawtio.what}, hello ${hawtio.what}!"), is("world, hello world!"));
        }

        @Test
        public void multibyteSystemProperties() {
            System.setProperty("hawtio.what", "世界");
            System.setProperty("こんにちは", "Hello");
            assertThat(Strings.resolvePlaceholders(null), nullValue());
            assertThat(Strings.resolvePlaceholders("こんにちは、${hawtio.what}！"), is("こんにちは、世界！"));
            assertThat(Strings.resolvePlaceholders("${こんにちは} world!"), is("Hello world!"));
        }

        @Test
        public void valuesWithPlaceholdersAreNotResolved() {
            System.setProperty("hawtio.what", "${world}");
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.what}!"), is("Hello ${world}!"));
            assertThat(Strings.resolvePlaceholders("Hello ${world}!"), is("Hello ${world}!"));
        }

        @Test
        public void mismatchedPlaceholders() {
            System.setProperty("nestedProperty", "what");
            System.setProperty("hawtio.what", "world");
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.what!"), is("Hello ${hawtio.what!"));
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.${nestedProperty}!"), is("Hello ${hawtio.what!"));
        }

        @Test
        public void nestedSystemProperties() {
            System.setProperty("doubleProperty", "hawtio.what");
            System.setProperty("nestedProperty", "what");
            System.setProperty("hawtio.what", "world");
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.${nestedProperty}}!"), is("Hello world!"));
            assertThat(Strings.resolvePlaceholders("${hawtio.${nestedProperty}}"), is("world"));
            assertThat(Strings.resolvePlaceholders("${hawtio.${nestedProperty}}, hello ${hawtio.${nestedProperty}}!"), is("world, hello world!"));
            assertThat(Strings.resolvePlaceholders("${doubleProperty}"), is("hawtio.what"));
            assertThat(Strings.resolvePlaceholders("${${doubleProperty}}"), is("world"));
            assertThat(Strings.resolvePlaceholders("${${${doubleProperty}}}"), is("${world}"));
        }

        @Test
        public void recursiveSystemProperties() {
            System.setProperty("nestedProperty", "what");
            System.setProperty("hawtio.what", "hawtio.${nestedProperty}");
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.${nestedProperty}}!"), is("Hello hawtio.${nestedProperty}!"));
            // no risk, because we don't resolve properties in system property values at all
//            assertThrows(IllegalArgumentException.class,
//                    () -> Strings.resolvePlaceholders("Hello ${hawtio.${nestedProperty}}!"));
        }

        @Test
        public void customProperties() {
            System.setProperty("hawtio.what", "world");
            Properties props = new Properties();
            props.setProperty("hawtio.what", "universe");
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.what}!"), is("Hello world!"));
            assertThat(Strings.resolvePlaceholders("Hello ${hawtio.what}!", props), is("Hello universe!"));
        }
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
            assertThat(Strings.cleanPath(input), equalTo(expected));
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
            assertThat(Strings.webContextPath((input)), equalTo(expected));
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
            assertThat(Strings.webContextPath(args.input, args.more), equalTo(args.expected));
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
            assertThat(Strings.hawtioPathIndex(ctx), equalTo(pathIndex));
        }
    }
}
