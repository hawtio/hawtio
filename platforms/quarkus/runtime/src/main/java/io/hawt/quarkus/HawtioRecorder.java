package io.hawt.quarkus;

import io.quarkus.runtime.annotations.Recorder;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

@Recorder
public class HawtioRecorder {

    public Handler<RoutingContext> pluginHandler(HawtioConfig pluginConfigs) {
        return new HawtioPluginHandler(pluginConfigs.pluginConfigs());
    }
}
