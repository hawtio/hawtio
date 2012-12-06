# hawt.io

**hawt.io** is web based management console for working with JMX, OSGi and open source projects like [Apache ActiveMQ](http://activemq.apache.org/), [Apache Camel](http://camel.apache.org/) and [Fuse Fabric](http://fuse.fusesource.org/fabric/)

## Trying out the console from Maven

From a git clone you should be able to run the sample web console as follows:

    cd hawtio
    mvn test-compile exec:java
    open http://localhost:8080/sample/

That should run a little sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs aavailable changes dynamically based onthe content.

If you are running Tomcat, Karaf, Fuse ESB or JBoss you could just deploy the hawtio.war to your container

## Want to hack on some code?

We love [contributions](https://github.com/hawtio/hawtio/blob/master/CONTRIBUTING.md)!

* [how to contribute](https://github.com/hawtio/hawtio/blob/master/CONTRIBUTING.md)
* [how to build the code](https://github.com/hawtio/hawtio/blob/master/BUILDING.md)
* [how to get started working on the code](https://github.com/hawtio/hawtio/blob/master/DEVELOPERS.md)
* [hawt.io mailing list](https://groups.google.com/d/forum/hawtio)
* [#hawtio IRC chat room on freenode.net](http://webchat.freenode.net/?channels=hawtio&uio=d4)
* [follow @hawtio on twitter](https://twitter.com/hawtio)

Its hawt, but stay cool! :)
