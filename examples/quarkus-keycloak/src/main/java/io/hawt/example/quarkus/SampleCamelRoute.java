package io.hawt.example.quarkus;

import javax.enterprise.context.ApplicationScoped;

import org.apache.camel.builder.endpoint.EndpointRouteBuilder;

@ApplicationScoped
public class SampleCamelRoute extends EndpointRouteBuilder {

    @Override
    public void configure() throws Exception {
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
