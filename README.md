**hawtio** is a lightweight and [modular](http://hawt.io/developers/plugins.html) HTML5 web console for managing your Java stuff. It's a _hawt_ console to help you stay cool!

<div id="myCarousel" class="carousel slide">
  <div class="carousel-inner">
    <div class="item active">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/camelRoute.png" alt="screenshot">
      <div class="carousel-caption">
        <h4>Camel Route</h4>
        <p>You can visualise your camel routes and see the throughput rates in real time</p>
      </div>
    </div>
    <div class="item">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/dashboard.png" alt="screenshot">
      <div class="carousel-caption">
        <h4>Dashboard</h4>
        <p>Create your own dashboards that are stored in git. Then share them on github!</p>
      </div>
    </div>
    <div class="item">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/wiki.png" alt="screenshot">
      <div class="carousel-caption">
        <h4>git based wiki</h4>
        <p>view and edit documentation pages for your running system; link stuff FTW!</p>
      </div>
    </div>
    <div class="item">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/activemqSend.png" alt="screenshot">
      <div class="carousel-caption">
        <h4>Send messages to ActiveMQ</h4>
        <p>Use XML or JSON syntax highlighting, auto-tag close and bracket/tag matching.</p>
      </div>
    </div>
    <div class="item">
     <img src="https://raw.github.com/hawtio/hawtio/master/website/src/images/screenshots/activemqBrowse.png" alt="screenshot">
      <div class="carousel-caption">
        <h4>Browse ActiveMQ Queues</h4>
        <p>See the message headers and payloads.</p>
      </div>
    </div>
  </div>
  <a class="left carousel-control" href="#myCarousel" data-slide="prev">&#8249;</a>
  <a class="right carousel-control" href="#myCarousel" data-slide="next">&#8250;</a>
</div>


**hawtio** has [plugins](http://hawt.io/developers/plugins.html) for a git-based Dashboard and Wiki, working with JMX, OSGi, [Apache ActiveMQ](http://activemq.apache.org/), [Apache Camel](http://camel.apache.org/), [Apache OpenEJB](http://openejb.apache.org/), [Apache Tomcat](http://tomcat.apache.org/), [Jetty](http://www.eclipse.org/jetty/), [JBoss](http://www.jboss.org/jbossas) and [Fuse Fabric](http://fuse.fusesource.org/fabric/)

You can dynamically [extend hawtio with your own plugins](http://hawt.io/developers/plugins.html) or automatically [discover plugins](http://hawt.io/developers/plugins.html) inside the JVM.

The only server side dependency (other than the static HTML/CSS/JS/images) is the excellent [Jolokia library](http://jolokia.org) which has small footprint (around 300Kb) and is available as a [JVM agent](http://jolokia.org/agent/jvm.html), or comes embedded as a servlet inside the **hawtio-web.war** or can be deployed as [an OSGi bundle](http://jolokia.org/agent/osgi.html).

**hawtio** also supports [Health MBeans](http://hawt.io/health/) to make it easy for your Java services to expose their health status so you can see how your Java stuff is behaving.


## Get started

### Using a Servlet Engine or Application Server

If you are running Tomcat 6/7, Jetty 7/8 or JBoss (7.1.1.Final) you could just deploy a WAR. e.g.

<table class="buttonTable">
  <tr>
    <td>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/snapshots/io/hawt/hawtio-web/1.0-SNAPSHOT/">Download hawtio-web.war</a>
    </td>
    <td>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/snapshots/io/hawt/sample/1.0-SNAPSHOT/">Download sample.war</a>
    </td>
  </tr>
  <tr>
    <td>
      a bare hawtio web application with minimal dependencies
    </td>
    <td>
      a hawtio web application which comes with some <a href="http://activemq.apache.org/">Apache ActiveMQ</a> and
      <a href="http://camel.apache.org/">Apache Camel</a> to play with which is even <i>hawter</i>
    </td>
  </tr>
</table>



Copy the WAR file to your deploy directory in your container; for simplicity use the 'hawtio' context path (e.g. by copying the WAR file to _hawtio.war_ in your deploy directory) then opening [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) and you should have your hawtio console to play with.

### Using Apache Karaf, Apache Servicemix, or Fuse ESB

If you are using a developer snapshot of [Fuse ESB](http://fusesource.com/products/fuse-esb-enterprise/) you can run:

    features:install hawtio

Otherwise if you are using a vanilla [Apache Karaf](http://karaf.apache.org/), [Apache ServiceMix](http://servicemix.apache.org/) or [Fuse ESB](http://fusesource.com/products/fuse-esb-enterprise/) use the following

Add the following to the **etc/org.ops4j.pax.url.mvn.cfg** to make sure you have the [sonatype snapshot repo](https://oss.sonatype.org/content/repositories/snapshots) in your settings

    org.ops4j.pax.url.mvn.repositories= \
        https://oss.sonatype.org/content/repositories/snapshots \

Now you can install hawtio via:

    features:addurl mvn:io.hawt/hawtio-karaf/1.0-SNAPSHOT/xml/features
    features:install hawtio

Otherwise just install a [hawtio-osgi.war](https://oss.sonatype.org/content/repositories/snapshots/io/hawt/hawtio-osgi/1.0-SNAPSHOT/) build directly:

    features:install war
    install -s https://oss.sonatype.org/content/repositories/snapshots/io/hawt/hawtio-osgi/1.0-SNAPSHOT/hawtio-osgi-1.0-20130224.214242-49.war

The hawtio console can then be viewed at [http://localhost:8181/hawtio/](http://localhost:8181/hawtio/).

### Using hawtio inside a stand alone Java application

If you do not use a servlet container or application server and wish to embed hawtio inside your process try the following:

Add the following to your pom.xml

    <dependency>
      <groupId>io.hawt</groupId>
      <artifactId>hawtio-embedded</artifactId>
      <version>${hawtio-version}</version>
     </dependency>

Then in your application run the following code:

    import io.hawt.embedded.Main;

    ...
    Main main = new Main();
    main.setWar("somePathOrDirectoryContainingHawtioWar");
    main.run();

If you wish to do anything fancy it should be easy to override the Main class to find the hawtio-web.war in whatever place you wish to locate it (such as your local maven repo or download it from some server etc).

### Using a git Clone

From a git clone you should be able to run the a sample hawtio console as follows:

    git clone git@github.com:hawtio/hawtio.git
    cd hawtio/sample
    mvn jetty:run

Then opening [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) should show hawtio with a sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is `java.lang/OperatingSystem`. Try looking at queues or Camel routes. Notice that as you change selections in the tree the list of tabs available changes dynamically based on the content.

## Want to hack on some code?

We love [contributions](http://hawt.io/contributing/index.html)!

* [hawtio FAQ](http://hawt.io/faq/index.html)
* [How to contribute](http://hawt.io/contributing/index.html)
* [How to build the code](http://hawt.io/building/index.html)
* [How to get started working on the code](http://hawt.io/developers/index.html)
* [Join the hawtio community](http://hawt.io/community/index.html)
