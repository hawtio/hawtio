package io.hawt.util;

import java.util.Arrays;
import java.util.Collections;

import org.hamcrest.CoreMatchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.Arguments;

import java.util.stream.Stream;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.fail;


public abstract class StringsTest {

    public static class SplitTest {

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
            return Stream.of ( // @formatter:off
                Arguments.arguments( "",        "" ),
            Arguments.arguments( "  ",      "  " ),
            Arguments.arguments( "/",       "/" ),
            Arguments.arguments( "a",       "a" ),
            Arguments.arguments( "/a",      "/a" ),
            Arguments.arguments( "a/",      "a" ),
            Arguments.arguments( "/a/",     "/a" ),
            Arguments.arguments( "//a/",    "/a" ),
            Arguments.arguments( "/a//",    "/a" ),
            Arguments.arguments( "//a//",   "/a" ),
            Arguments.arguments( "/a/b/",   "/a/b" ),
            Arguments.arguments( "/a///b/", "/a/b" )
            ); // @formatter:on
        }



        /*public CleanPathTest(final String input, final String expected) {
            this.input = input;
            this.expected = expected;
        }*/

        @ParameterizedTest
        @MethodSource("params")
        public void test(String input, String expected) {
            assertThat(Strings.cleanPath(input), CoreMatchers.equalTo(expected));
        }
    }


    public static class WebContextPathFromSingleComponentTest {


        public static Stream<Arguments> params() {
            return Stream.of(// @formatter:off
                Arguments.arguments( null,      ""     ),
                Arguments.arguments( "",        ""     ),
                Arguments.arguments( " ",       "/ "   ),
                Arguments.arguments( "/",       ""     ),
                Arguments.arguments( "a",       "/a"   ),
                Arguments.arguments( "/a",      "/a"   ),
                Arguments.arguments( "a/",      "/a"   ),
                Arguments.arguments( "/a/",     "/a"   ),
                Arguments.arguments( "//a/",    "/a"   ),
                Arguments.arguments( "/a//",    "/a"   ),
                Arguments.arguments( "//a//",   "/a"   ),
                Arguments.arguments( "/a/b/",   "/a/b" ),
                Arguments.arguments( "/a///b/", "/a/b" )
            ); // @formatter:on
        }




        @ParameterizedTest
        @MethodSource("params")
        public void test(String input, String expected) {
            assertThat(Strings.webContextPath((input)),
                   CoreMatchers.equalTo(expected));
        }
    }


    public static class WebContextPathFromMultipleComponentsTest {

        private static class Parameters {
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
            return Stream.of(// @formatter:off
                new Parameters( null,           ""  ),
                new Parameters("",              ""     ),
                new Parameters( " ",            "/ "   ),
                new Parameters( "/",            ""     ),
                new Parameters( "a",            "/a"   ),
                new Parameters( "/a",           "/a"   ),
                new Parameters( "a/",           "/a"   ),
                new Parameters( "/a/",          "/a"   ),
                new Parameters( "//a/",         "/a"   ),
                new Parameters( "/a//",         "/a"   ),
                new Parameters( "//a//",        "/a"   ),
                new Parameters( null,    null,  ""     ),
                new Parameters( null,    "a",   "/a"   ),
                new Parameters( "a",     null,  "/a"   ),
                new Parameters( "a",     "b",   "/a/b" ),
                new Parameters( "/a",    "b",   "/a/b" ),
                new Parameters( "a",     "/b",  "/a/b" ),
                new Parameters( "/a",    "/b",  "/a/b" ),
                new Parameters( "/a/",   "b",   "/a/b" ),
                new Parameters( "/a/",   "/b",  "/a/b" ),
                new Parameters( "/a/",   "/b/", "/a/b" ),
                new Parameters( "/a//", "/b//", "/a/b" )
            ); // @formatter:on
        }



       /* public WebContextPathFromMultipleComponentsTest(final Object... input) {
            this.first = (String) input[0];
            this.more = input.length > 2
                    ? Arrays.copyOfRange(input, 1, input.length - 1, String[].class)
                    : new String[0];
            this.expected = (String) input[input.length - 1];
        }*/

        @ParameterizedTest
        @MethodSource("params")
        public void test(Parameters args) {
            assertThat(Strings.webContextPath(args.input, args.more),
                    CoreMatchers.equalTo(args.expected));
        }
    }

}
