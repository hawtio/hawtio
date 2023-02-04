package io.hawt.util;

import java.util.Arrays;
import java.util.Collections;

import org.hamcrest.CoreMatchers;
import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.fail;

@RunWith(Enclosed.class)
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

    @RunWith(Parameterized.class)
    public static class CleanPathTest {

        @Parameters(name = "\"{0}\" -> \"{1}\"")
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { "",        "" },
                { "  ",      "  " },
                { "/",       "/" },
                { "a",       "a" },
                { "/a",      "/a" },
                { "a/",      "a" },
                { "/a/",     "/a" },
                { "//a/",    "/a" },
                { "/a//",    "/a" },
                { "//a//",   "/a" },
                { "/a/b/",   "/a/b" },
                { "/a///b/", "/a/b" }
            }; // @formatter:on
        }

        private final String input;
        private final String expected;

        public CleanPathTest(final String input, final String expected) {
            this.input = input;
            this.expected = expected;
        }

        @Test
        public void test() {
            assertThat(Strings.cleanPath(input), CoreMatchers.equalTo(expected));
        }
    }

    @RunWith(Parameterized.class)
    public static class WebContextPathFromSingleComponentTest {

        @Parameters(name = "\"{0}\" -> \"{1}\"")
        public static Object[][] params() {
            return new Object[][] { // @formatter:off
                { null,      ""     },
                { "",        ""     },
                { " ",       "/ "   },
                { "/",       ""     },
                { "a",       "/a"   },
                { "/a",      "/a"   },
                { "a/",      "/a"   },
                { "/a/",     "/a"   },
                { "//a/",    "/a"   },
                { "/a//",    "/a"   },
                { "//a//",   "/a"   },
                { "/a/b/",   "/a/b" },
                { "/a///b/", "/a/b" }
            }; // @formatter:on
        }

        private final String input;
        private final String expected;

        public WebContextPathFromSingleComponentTest(final String input,
                final String expected) {
            this.input = input;
            this.expected = expected;
        }

        @Test
        public void test() {
            assertThat(Strings.webContextPath(input),
                    CoreMatchers.equalTo(expected));
        }
    }

    @RunWith(Parameterized.class)
    public static class WebContextPathFromMultipleComponentsTest {

        @Parameters
        public static Object[][] params() {
            return new Object[][][] { // @formatter:off
                { { null,           ""     } },
                { {"",              ""     } },
                { { " ",            "/ "   } },
                { { "/",            ""     } },
                { { "a",            "/a"   } },
                { { "/a",           "/a"   } },
                { { "a/",           "/a"   } },
                { { "/a/",          "/a"   } },
                { { "//a/",         "/a"   } },
                { { "/a//",         "/a"   } },
                { { "//a//",        "/a"   } },
                { { null,    null,  ""     } },
                { { null,    "a",   "/a"   } },
                { { "a",     null,  "/a"   } },
                { { "a",     "b",   "/a/b" } },
                { { "/a",    "b",   "/a/b" } },
                { { "a",     "/b",  "/a/b" } },
                { { "/a",    "/b",  "/a/b" } },
                { { "/a/",   "b",   "/a/b" } },
                { { "/a/",   "/b",  "/a/b" } },
                { { "/a/",   "/b/", "/a/b" } },
                { { "/a//", "/b//", "/a/b" } },
            }; // @formatter:on
        }

        private final String first;
        private final String[] more;
        private final String expected;

        public WebContextPathFromMultipleComponentsTest(final Object... input) {
            this.first = (String) input[0];
            this.more = input.length > 2
                    ? Arrays.copyOfRange(input, 1, input.length - 1, String[].class)
                    : new String[0];
            this.expected = (String) input[input.length - 1];
        }

        @Test
        public void test() {
            assertThat(Strings.webContextPath(first, more),
                    CoreMatchers.equalTo(expected));
        }
    }

}
