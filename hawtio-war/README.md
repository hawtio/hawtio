## hawtio web console for Java

This is the default hawtio web console for Java that is a distributed as a `.war` deployment unit.

### Running locally

To try the console you can run it from command line with

    mvn wildfly:run

Then the console is accessible from <http://localhost:8080/hawtio/>

#### Using Jetty

If you want to run the console on Jetty instead of Undertow (WildFly), run it with

    mvn jetty:run-war
