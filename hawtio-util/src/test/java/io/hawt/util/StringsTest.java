package io.hawt.util;

import java.util.Arrays;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

public class StringsTest {

    @Test
    public void split() {
        assertThat(Strings.split("abc", ","), is(Arrays.asList("abc")));
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
