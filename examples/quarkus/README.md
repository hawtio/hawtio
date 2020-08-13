# Hawtio Quarkus Example

This sample application shows how to run Hawtio with Quarkus.

## How to run

Run in development mode with:

    mvn compile quarkus:dev
    
Or build the project and execute the runnable JAR:

    mvn package && java -jar target/hawtio-example-quarkus-2.11-SNAPSHOT-runner.jar

Hawtio is available at http://localhost:8080/hawtio. By default, authentication is enabled with username 'hawtio' & password 'hawtio'. 
This can be customized together with some of the other Hawtio configuration options by editing 
`src/main/resources/application.properties`.
