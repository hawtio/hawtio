package io.hawt.springboot;

import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * Exposes Hawtio Plugins as a management (/actuator) RestController
 */
@SuppressWarnings("ClassCanBeRecord")
public class HawtioPluginController {

    private final List<HawtioPlugin> plugins;

    public HawtioPluginController(List<HawtioPlugin> plugins) {
        this.plugins = plugins;
    }

    @ResponseBody
    public List<HawtioPlugin> getPlugins() {
        return plugins;
    }
}
