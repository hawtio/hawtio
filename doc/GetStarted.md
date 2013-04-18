You can use hawtio in many different containers - or outside a container. Below are all the various options for running hawtio.

The out of the box defaults try to do the right thing for most folks but you may want to check out [the configuration guide](http://hawt.io/configuration/index.html) to see how to configure things.


## Using a Servlet Engine or Application Server

If you are running Tomcat 5/6/7, Jetty 7/8 or JBoss (7.1.1.Final) you could just deploy a WAR:

<table class="buttonTable">
  <tr>
    <td>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-web/1.0/hawtio-web-1.0.war">Download hawtio-web.war</a>
    </td>
    <td>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/sample/1.0/sample-1.0.war">Download sample.war</a>
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

To see whats changed lately check out the [change log](http://hawt.io/changelog.html).

If you don't see a Tomcat / Jetty / JBoss tab for your container you may need to enable JMX.

### Enable JMX on Jetty 8.x

If you are using Jetty 8.x then JMX may not enabled by default, so make sure the following line is not commented out in start.ini (you may have to uncomment it to enable JMX).

    etc/jetty-jmx.xml

## Using Apache Karaf, Apache Servicemix, or Fuse ESB

If you are using a developer snapshot of [Fuse ESB](http://fusesource.com/products/fuse-esb-enterprise/) you can run:

    features:install hawtio

Otherwise if you are using a vanilla [Apache Karaf](http://karaf.apache.org/), [Apache ServiceMix](http://servicemix.apache.org/) or [Fuse ESB](http://fusesource.com/products/fuse-esb-enterprise/) use the following

Now you can install hawtio via:

    features:addurl mvn:io.hawt/hawtio-karaf/1.0/xml/features
    features:install hawtio

The hawtio console can then be viewed at [http://localhost:8181/hawtio/](http://localhost:8181/hawtio/).

## Using hawtio inside a stand alone Java application

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

## Using a git Clone

From a git clone you should be able to run the a sample hawtio console as follows:

    git clone git@github.com:hawtio/hawtio.git
    cd hawtio/sample
    mvn jetty:run

Then opening [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) should show hawtio with a sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is `java.lang/OperatingSystem`. Try looking at queues or Camel routes. Notice that as you change selections in the tree the list of tabs available changes dynamically based on the content.
