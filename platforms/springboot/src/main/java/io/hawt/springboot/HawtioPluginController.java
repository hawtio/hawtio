package io.hawt.springboot;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponents;

import java.util.List;

public class HawtioPluginController {

    private final EndpointPathResolver endpointPath;
    private List<HawtioPlugin> plugins;

    public HawtioPluginController(final EndpointPathResolver endpointPath) {
        this.endpointPath = endpointPath;
    }

    public void setPlugins(final List<HawtioPlugin> plugins) {
        this.plugins = plugins;
    }

    public String forwardHawtioRequestToIndexHtml(HttpServletRequest request) {
        final String path = endpointPath.resolve("hawtio");

        if (request.getRequestURI().equals(path)) {
            String query = request.getQueryString();
            if (query != null && !query.isEmpty()) {
                return "redirect:" + path + "/index.html?" + query;
            }
            return "redirect:" + path + "/index.html";
        }

        final UriComponents uriComponents = ServletUriComponentsBuilder.fromPath(path)
            .path("/index.html")
            .build();
        return "forward:" + uriComponents.getPath();
    }

//    @RequestMapping("/plugin")
    @ResponseBody
    public List<HawtioPlugin> getPlugins() {
        return plugins;
    }
}
