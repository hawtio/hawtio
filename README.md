**hawtio** is a lightweight and [modular](http://hawt.io/developers/plugins.html) HTML5 web console for managing your Java stuff. Its a _hawt_ console to help you stay cool!

<ul class="thumbnails">
  <li class="span10">
    <div class="thumbnail">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/camelRoute.png" alt="screenshot">
    </div>
  </li>
</ul>

**hawtio** has [plugins](http://hawt.io/developers/plugins.html) for JMX, OSGi, [Apache ActiveMQ](http://activemq.apache.org/), [Apache Camel](http://camel.apache.org/), [Apache Tomcat](http://tomcat.apache.org/), [Jetty](http://www.eclipse.org/jetty/) and [Fuse Fabric](http://fuse.fusesource.org/fabric/)

You can dynamically [extend hawt.io with your own plugins](http://hawt.io/developers/plugins.html) or automaticaly [discover plugins](http://hawt.io/developers/plugins.html) inside the JVM

The only server side dependency (other than the static HTML/CSS/JS/images) is the excellent [Jolokia library](http://jolokia.org) which has small footprint (around 300Kb) and is available as a [JVM agent](http://jolokia.org/agent/jvm.html), or comes embedded as a servlet inside the **hawtio-web.war** or can be deployed as [an OSGi bundle](http://jolokia.org/agent/osgi.html).

**hawtio** also supports [Health MBeans](http://hawt.io/health/) to make it easy for your Java services to expose their health status so you can see how your Java stuff is behaving


## Get started

If you are running Tomcat, Jetty or JBoss you could just deploy the [hawtio-web.war](https://oss.sonatype.org/content/repositories/snapshots/io/hawt/hawtio-web/1.0-SNAPSHOT/) to your container at the hawtio context path (e.g. by renaming the file to _hawtio.war_ in your deploy directory) then opening [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) and you should have your hawtio console.

If you are using a developer snapshot of [Fuse ESB](http://fusesource.com/products/fuse-esb-enterprise/) you can run:

    features:install hawtio

Or if you are using a vanilla [Apache Karaf](http://karaf.apache.org/) container or release of [Fuse ESB](http://fusesource.com/products/fuse-esb-enterprise/) you can add this line to the **etc/org.ops4j.pax.url.mvn.cfg** file (this step is only until we release 1.0 of hawtio)

    org.ops4j.pax.url.mvn.repositories= \
         https://oss.sonatype.org/content/repositories/snapshots=sonatype.snapshot.repo \

Then in the Karaf / Fuse ESB console try:

    features:install war
    install mvn:io.hawt/hawtio-web/1.0-SNAPSHOT/war

Then open [http://localhost:8181/hawtio/](http://localhost:8181/hawtio/)

Or from a git clone you should be able to run the a sample hawtio console as follows:

    git clone git@github.com:hawtio/hawtio.git
    cd hawtio/sample
    mvn jetty:run

Then opening [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) should show hawtio with a sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs available changes dynamically based on the content.

## Want to hack on some code?

We love [contributions](http://hawt.io/contributing/index.html)!

* [hawtio FAQ](http://hawt.io/faq/index.html)
* [how to contribute](http://hawt.io/contributing/index.html)
* [how to build the code](http://hawt.io/building/index.html)
* [how to get started working on the code](http://hawt.io/developers/index.html)
* [join the hawt.io community](http://hawt.io/community/index.html)

Its a hawt console to help you can stay cool!