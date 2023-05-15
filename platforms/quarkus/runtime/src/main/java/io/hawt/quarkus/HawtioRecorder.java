package io.hawt.quarkus;

import io.quarkus.runtime.annotations.Recorder;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

@Recorder
public class HawtioRecorder {

    public Handler<RoutingContext> pluginHandler(Map<String, HawtioConfig.PluginConfig> pluginConfigs) {
        return new HawtioPluginHandler(pluginConfigs);
    }
}
