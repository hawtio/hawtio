/*
 * Copyright 2024 hawt.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.util;

import java.util.stream.Stream;

import jakarta.servlet.ServletContext;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import static io.hawt.web.auth.SessionExpiryFilter.SERVLET_PATH;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class WebHelperTest {

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
            assertThat(WebHelper.cleanPath(input), equalTo(expected));
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
            assertThat(WebHelper.webContextPath((input)), equalTo(expected));
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
            assertThat(WebHelper.webContextPath(args.input, args.more), equalTo(args.expected));
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
            assertThat(WebHelper.hawtioPathIndex(ctx), equalTo(pathIndex));
        }
    }

}
