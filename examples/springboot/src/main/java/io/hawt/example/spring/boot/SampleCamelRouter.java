package io.hawt.example.spring.boot;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class SampleCamelRouter extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        // Uncomment to enable the Camel plugin Debug tab
        // getContext().setDebugging(true);

        from("quartz:cron?cron={{quartz.cron}}").routeId("cron")
            .setBody().constant("Hello Camel! - cron")
            .to("stream:out")
            .to("mock:result");

        from("quartz:simple?trigger.repeatInterval={{quartz.repeatInterval}}").routeId("simple")
            .setBody().constant("Hello Camel! - simple")
            .to("stream:out")
            .to("mock:result");
    }

}
