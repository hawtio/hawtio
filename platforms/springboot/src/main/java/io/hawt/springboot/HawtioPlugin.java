package io.hawt.springboot;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import static com.fasterxml.jackson.annotation.JsonInclude.*;

/**
 * Hawtio v3 remote plugin for Spring Boot.
 *
 * Hawtio v3 plugin system is based on <a href="https://module-federation.github.io/">Webpack Module Federation</a>.
 *
 * This interface is the Java representation of
 * <a href="https://github.com/hawtio/hawtio-next/blob/v0.2.0-dev.5/packages/hawtio/src/core/core.ts#L37-L39">HawtioRemote</a>
 * interface in hawtio-next project, which is compatible with
 * <a href="https://github.com/module-federation/universe/blob/utils-1.4.0/packages/utilities/src/utils/importRemote.ts#L9-L15">ImportRemoteOptions</a>
 * interface defined in @module-federation/utilities package.
 */
@JsonInclude(Include.NON_NULL)
public class HawtioPlugin {

    private String url;
    private String scope;
    private String module;
    private String remoteEntryFileName;
    private Boolean bustRemoteEntryCache;
    private String pluginEntry;

    /**
     * Use a plugin from remote repository.
     * These are the parameters required to load a remote Hawtio plugin (a.k.a. Module Federation remote module):
     *
     * @param url The URL of the remote entry for the plugin. This must be the same location as the Hawtio console.
     * @param scope The name of the container defined at Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
     * @param module The path exposed from Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
     */
    public HawtioPlugin(String scope, String module, String url) {
        this.scope = scope;
        this.module = module;
        this.url = url;
    }

    /**
     * Use a plugin that's located in the application itself.
     * This constructor automatically uses address of the application.
     * These are the parameters required to load a remote Hawtio plugin (a.k.a. Module Federation remote module):
     *
     * @param scope The name of the container defined at Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
     * @param module The path exposed from Webpack ModuleFederationPlugin. See also: sample-plugin/craco.config.js
     */
    public HawtioPlugin(String scope, String module) {
        this(scope, module, "");
    }

    @JsonProperty("url")
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @JsonProperty("scope")
    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    @JsonProperty("module")
    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    @JsonProperty("remoteEntryFileName")
    public String getRemoteEntryFileName() {
        return remoteEntryFileName;
    }

    public void setRemoteEntryFileName(String remoteEntryFileName) {
        this.remoteEntryFileName = remoteEntryFileName;
    }

    @JsonProperty("bustRemoteEntryCache")
    public Boolean getBustRemoteEntryCache() {
        return bustRemoteEntryCache;
    }

    public void setBustRemoteEntryCache(Boolean bustRemoteEntryCache) {
        this.bustRemoteEntryCache = bustRemoteEntryCache;
    }

    @JsonProperty("pluginEntry")
    public String getPluginEntry() {
        return pluginEntry;
    }

    public void setPluginEntry(String pluginEntry) {
        this.pluginEntry = pluginEntry;
    }
}
