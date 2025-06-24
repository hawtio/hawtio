package io.hawt.tests.spring.boot;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class SampleCamelRouter extends RouteBuilder {

    @Override
    public void configure() {
        from("quartz:cron?cron={{quartz.cron}}").routeId("cron")
            .setBody().constant("Hello Camel! - cron")
            .to("stream:out")
            .to("mock:result");

        from("quartz:simple?trigger.repeatInterval={{quartz.repeatInterval}}").routeId("simple")
            .setBody().constant("Hello Camel! - simple")
            .to("stream:out")
            .to("mock:result");

        from("timer:interval1")
            .routeId("interval1Route")
            .routeGroup("intervals")
            .to("log:interval1");

        from("timer:interval2")
            .routeId("interval2Route")
            .routeGroup("intervals")
            .to("log:interval2");

        from("timer:subject1")
            .routeId("subject1Route")
            .routeGroup("subjects")
            .to("log:subject1");

        from("timer:subject2")
            .routeId("subject2Route")
            .routeGroup("subjects")
            .to("log:subject2");
    }
}
