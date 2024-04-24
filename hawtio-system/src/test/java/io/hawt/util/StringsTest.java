package io.hawt.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.Properties;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.jupiter.api.Assertions.fail;


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

}
