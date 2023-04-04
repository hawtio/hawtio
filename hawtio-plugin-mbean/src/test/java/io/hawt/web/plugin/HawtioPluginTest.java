package io.hawt.web.plugin;

import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.arrayContaining;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

public class HawtioPluginTest {

    @Test
    public void build() {
        HawtioPlugin plugin = new HawtioPlugin()
            .url("http://localhost:3000")
            .scope("test")
            .module("./plugin");

        assertThat(plugin.getUrl(), is("http://localhost:3000"));
        assertThat(plugin.getScope(), is("test"));
        assertThat(plugin.getModule(), is("./plugin"));
        assertThat(plugin.getRemoteEntryFileName(), nullValue());
        assertThat(plugin.getBustRemoteEntryCache(), nullValue());
        assertThat(plugin.getPluginEntry(), nullValue());

        plugin
            .remoteEntryFileName("remoteEntry.js")
            .bustRemoteEntryCache(true)
            .pluginEntry("registerPlugin");

        assertThat(plugin.getRemoteEntryFileName(), is("remoteEntry.js"));
        assertThat(plugin.getBustRemoteEntryCache(), is(true));
        assertThat(plugin.getPluginEntry(), is("registerPlugin"));
    }
}
