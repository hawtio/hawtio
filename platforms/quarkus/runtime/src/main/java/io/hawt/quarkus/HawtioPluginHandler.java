package io.hawt.quarkus;

import io.vertx.core.Handler;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;
import java.util.Objects;

/**
 * Vert.x handler to output JSON content for custom Hawtio plugins
 */
public class HawtioPluginHandler implements Handler<RoutingContext> {

    private final Map<String, HawtioConfig.PluginConfig> pluginConfigs;
    private final String jsonContent;

    public HawtioPluginHandler(Map<String, HawtioConfig.PluginConfig> pluginConfigs) {
        Objects.requireNonNull(pluginConfigs, "pluginConfigs must not be null");
        this.pluginConfigs = pluginConfigs;
        this.jsonContent = initContent();
    }

    private String initContent() {
        JsonArray plugins = new JsonArray();
        pluginConfigs.forEach((name, config) -> {
            JsonObject object = new JsonObject();
            // mandatory parameters
            object.put("url", config.url.orElse("") );
            object.put("scope", config.scope);
            object.put("module", config.module);
            // optional parameters
            config.remoteEntryFileName.ifPresent(value -> object.put("remoteEntryFileName", value));
            config.bustRemoteEntryCache.ifPresent(value -> object.put("bustRemoteEntryCache", value));
            config.pluginEntry.ifPresent(value -> object.put("pluginEntry", value));
            plugins.add(object);
        });
        return Json.encode(plugins);
    }

    @Override
    public void handle(RoutingContext routingContext) {

        routingContext.response()
            .putHeader("content-type", "application/json; charset=utf-8")
            .end(jsonContent);
    }
}
