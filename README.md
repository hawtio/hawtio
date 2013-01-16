**hawt.io** is a modular HTML5 web console for managing Java stuff


<ul class="thumbnails">
  <li class="span10">
    <div class="thumbnail">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/camelRoute.png" alt="screenshot">
    </div>
  </li>
</ul>

**hawt.io** is modular and has plugins for things like JMX, OSGi, [Apache ActiveMQ](http://activemq.apache.org/), [Apache Camel](http://camel.apache.org/) and [Fuse Fabric](http://fuse.fusesource.org/fabric/). You can dynamically extend hawt.io with your own plugs or automaticaly discover plugins inside the JVM.


## Get started

From a git clone you should be able to run the a sample hawt.io console as follows:

    git clone git@github.com:hawtio/hawtio.git
    cd hawtio/sample
    mvn jetty:run
    open http://localhost:8080/hawtio/

That should run a little sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs available changes dynamically based on the content.

If you are running Tomcat, Karaf, Fuse ESB or JBoss you could just deploy the **hawtio-web.war** to your container

## Want to hack on some code?

We love [contributions](http://hawt.io/contributing/index.html)!

* [how to contribute](http://hawt.io/contributing/index.html)
* [how to build the code](http://hawt.io/building/index.html)
* [how to get started working on the code](http://hawt.io/developers/index.html)
* [join the hawt.io community](http://hawt.io/community/index.html)

Its hawt, but stay cool! :)
