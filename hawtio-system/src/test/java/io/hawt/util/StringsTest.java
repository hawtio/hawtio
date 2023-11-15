package io.hawt.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Stream;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.jupiter.params.provider.Arguments.arguments;


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

}
