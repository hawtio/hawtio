package io.hawt.web.plugin;

import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.arrayContaining;
import static org.hamcrest.Matchers.is;

public class HawtioPluginTest {

    @Test
    public void setScripts() {
        HawtioPlugin plugin = new HawtioPlugin();

        plugin.setScripts("");
        assertThat(plugin.getScripts().length, is(1));
        assertThat(plugin.getScripts(), arrayContaining(""));

        plugin.setScripts("a,b,c");
        assertThat(plugin.getScripts().length, is(3));
        assertThat(plugin.getScripts(), arrayContaining("a", "b", "c"));
    }
}
