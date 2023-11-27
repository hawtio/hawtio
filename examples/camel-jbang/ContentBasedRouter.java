// camel-k: language=java

import org.apache.camel.builder.RouteBuilder;

import static org.apache.camel.builder.PredicateBuilder.*;

public class ContentBasedRouter extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        String location = "Everest";
        String message = "Today's weather in " + location + " is: ";
        from("quartz:router?trigger.repeatInterval={{quartz.repeatInterval:60000}}")
            .routeId("content-based-router")
            .toF("https://wttr.in/~%s?format=j1", location)
            .transform().jsonpath("$.current_condition[0].weatherDesc[0].value").choice()
            .when(or(body().contains("Sunny"), body().contains("Clear")))
                .transform().constant(message + "☀")
                .endChoice()
            .when(or(body().contains("Cloudy"), body().contains("cloudy"), body().contains("Overcast")))
                .transform().constant(message + "☁")
                .endChoice()
            .when(body().contains("rain"))
                .transform().constant(message + "☂")
                .endChoice()
            .otherwise()
                .transform().simple(message + "${body}")
            .end()
            .to("stream:out");
    }
}
