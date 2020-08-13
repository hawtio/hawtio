package io.hawt.quarkus;

import io.vertx.core.Handler;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

/**
 * Vert.x handler to output JSON content for custom Hawtio plugins
 */
public class HawtioPluginHandler implements Handler<RoutingContext> {

    private final Map<String, HawtioConfig.HawtioPluginConfig> pluginConfigs;

    public HawtioPluginHandler(Map<String, HawtioConfig.HawtioPluginConfig> pluginConfigs) {
        this.pluginConfigs = pluginConfigs;
    }

    @Override
    public void handle(RoutingContext routingContext) {
        JsonArray plugins = new JsonArray();

        pluginConfigs.forEach((name, config) -> {
            if (config.scriptPaths.isPresent()) {
                JsonObject object = new JsonObject();
                object.put("Name", name);
                object.put("Context", "");
                object.put("Domain", "");
                object.put("Scripts", config.scriptPaths.get());
                plugins.add(object);
            }
        });

        routingContext.response()
            .putHeader("content-type", "application/json; charset=utf-8")
            .end(Json.encode(plugins));
    }
}
