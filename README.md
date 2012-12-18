**hawt.io** is a lightweight web based management console for working with JMX, OSGi and open source projects like [Apache ActiveMQ](http://activemq.apache.org/), [Apache Camel](http://camel.apache.org/) and [Fuse Fabric](http://fuse.fusesource.org/fabric/).

## Get started

From a git clone you should be able to run the a sample hawt.io console as follows:

    git clone git@github.com:hawtio/hawtio.git
    cd hawtio/sample
    mvn jetty:run
    open http://localhost:8080/hawtio/

That should run a little sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs aavailable changes dynamically based onthe content.

If you are running Tomcat, Karaf, Fuse ESB or JBoss you could just deploy the **hawtio-web.war** to your container

## Want to hack on some code?

We love [contributions](http://hawt.io/contributing/index.html)!

* [how to contribute](http://hawt.io/contributing/index.html)
* [how to build the code](http://hawt.io/building/index.html)
* [how to get started working on the code](http://hawt.io/developers/index.html)
* [join the hawt.io community](http://hawt.io/community/index.html)

Its hawt, but stay cool! :)
