package io.hawt.springboot;

import java.util.Map;
import java.util.function.Supplier;

import org.jolokia.server.core.http.AgentServlet;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.web.EndpointServlet;
import org.springframework.boot.actuate.endpoint.web.annotation.ServletEndpoint;

/**
 * {@link Endpoint @Endpoint} to expose a Jolokia {@link AgentServlet}.
 */
@ServletEndpoint(id = "jolokia")
public class JolokiaEndpoint implements Supplier<EndpointServlet> {

    private final Map<String, String> initParameters;

    public JolokiaEndpoint(Map<String, String> initParameters) {
        this.initParameters = initParameters;
    }

    @Override
    public EndpointServlet get() {
        return new EndpointServlet(AgentServlet.class).withInitParameters(this.initParameters);
    }

}
