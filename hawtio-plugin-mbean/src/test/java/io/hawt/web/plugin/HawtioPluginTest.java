package io.hawt.web.plugin;

import org.junit.Test;

import static org.junit.Assert.*;
import static org.hamcrest.Matchers.*;

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
