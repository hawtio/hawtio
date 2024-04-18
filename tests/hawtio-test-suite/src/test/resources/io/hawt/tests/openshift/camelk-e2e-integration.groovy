from("quartz:cron?cron=0/10 * * * * ?").routeId("cron")
            .setBody().constant("Hello Camel! - cron")
            .to("stream:out")
            .to("mock:result");

from("quartz:simple?trigger.repeatInterval=10000").routeId("simple")
            .setBody().constant("Hello Camel! - simple")
            .to("stream:out")
            .to("mock:result");
