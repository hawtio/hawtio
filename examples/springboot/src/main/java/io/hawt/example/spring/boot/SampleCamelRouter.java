package io.hawt.example.spring.boot;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class SampleCamelRouter extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        from("timer:hello?period={{timer.period}}")
            .setBody().constant("Hello Camel!")
            .to("stream:out")
            .to("mock:result");
    }

}
