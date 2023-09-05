package io.hawt.tests.quarkus;

import org.apache.camel.builder.endpoint.EndpointRouteBuilder;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SampleCamelRoute extends EndpointRouteBuilder {

    @Override
    public void configure() throws Exception {
        // Uncomment to enable the Camel plugin Debug tab
        getContext().setDebugging(true);

        from(quartz("cron").cron("{{quartz.cron}}")).routeId("cron")
            .setBody().constant("Hello Camel! - cron")
            .to(stream("out"))
            .to(mock("result"));

        from("quartz:simple?trigger.repeatInterval={{quartz.repeatInterval}}").routeId("simple")
            .setBody().constant("Hello Camel! - simple")
            .to(stream("out"))
            .to(mock("result"));
    }

}
