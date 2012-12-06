# hawt.io

**hawt.io** is web based management console for working with JMX and open source projects like [Apache ActiveMQ](http://activemq.apache.org/), [Apache Camel](http://camel.apache.org/) and [Fuse Fabric](http://fuse.fusesource.org/fabric/)

## Trying out the console from Maven

From a git clone you should be able to run the sample web console as follows:

    cd hawtio
    mvn test-compile exec:java
    open http://localhost:8080/sample/

That should run a little sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs aavailable changes dynamically based onthe content.

If you are running Tomcat, Karaf, Fuse ESB or JBoss you could just deploy the hawtio.war to your container

## More help

We love [contributions](CONTRIBUTING.md)!

* [how to contribute](CONTRIBUTING.md)
* [how to build the code](BUILDING.md)
* [how to get started working on the code](DEVELOPERS.md)

Its hawt, but stay cool! :)
