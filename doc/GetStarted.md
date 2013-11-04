You can use hawtio in many different containers - or outside a container. Below are all the various options for running hawtio.

The out of the box defaults try to do the right thing for most folks but you may want to check out [the configuration guide](http://hawt.io/configuration/index.html) to see how to configure things.


## Using the executable jar

You can startup hawtio on your machine using the hawtio-app executable jar.

<a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-app/1.2-M27/hawtio-app-1.2-M27.jar">Download the executable hawtio-app-1.2-M27.jar</a>

Once you have downloaded it, just run this from the command line:

    java -jar hawtio-app-1.2-M27.jar

And the console should show you which URL to open to view hawtio; which by default is [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/)

You can specify the port number to use, for example to use port 8090 run from the command line:

    java -jar hawtio-app-1.2-M27.jar --port 8090

hawtio supports other options which you can get listed by running from command line:

    java -jar hawtio-app-1.2-M27.jar --help

## Using a Servlet Engine or Application Server

If you are running Tomcat 5/6/7, Jetty 7/8 or JBoss (7.1.1.Final) you could just deploy a WAR:

<table class="buttonTable">
  <tr>
    <td>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-default/1.2-M27/hawtio-default-1.2-M27.war">Download hawtio-default.war</a>
    </td>
    <td>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/sample/1.2-M27/sample-1.2-M27.war">Download sample.war</a>
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

Copy the WAR file to your deploy directory in your container.

If you rename the downloaded file to _hawtio.war_ then drop it into your deploy directory then open [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) and you should have your hawtio console to play with.

Otherwise you will need to use either [http://localhost:8080/hawtio-default-1.2-M27/](http://localhost:8080/hawtio-default-1.2-M27/) or [http://localhost:8080/sample-1.2-M27/](http://localhost:8080/sample-1.2-M27/)  depending on the file name you downloaded.

Please check [the configuration guide](http://hawt.io/configuration/index.html) to see how to configure things; in particular security.

If you are working offline and have no access to the internet on the machines you want to use with hawtio then you may wish to
 <a class="btn" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-default-offline/1.2-M27/hawtio-default-offline-1.2-M27.war">Download hawtio-default-offline.war</a> which avoids some pesky errors appearing in your log on startup (as the default behaviour is to clone a git repo on startup for some default wiki and dashboard content).

To see whats changed lately check out the [change log](http://hawt.io/changelog.html).

If you don't see a Tomcat / Jetty / JBoss tab for your container you may need to enable JMX.

## Using Fuse, Apache Karaf or Apache Servicemix

If you are using 6.1 or later of [JBoss Fuse](http://www.jboss.org/products/fuse), then hawtio is installed out of the box

Otherwise if you are using 6.0 or earlier of [Fuse](http://www.jboss.org/products/fuse) or a vanilla [Apache Karaf](http://karaf.apache.org/) or [Apache ServiceMix](http://servicemix.apache.org/) then try the following:

    features:addurl mvn:io.hawt/hawtio-karaf/1.2-M27/xml/features
    features:install hawtio

If you are using [Apache Karaf](http://karaf.apache.org/) 2.3.3 or newer then you can use 'features:chooseurl' which is simpler to do:

    features:chooseurl hawtio
    features:install hawtio

The hawtio console can then be viewed at [http://localhost:8181/hawtio/](http://localhost:8181/hawtio/). The default login for Karaf is karaf/karaf, and for ServiceMix its smx/smx.

**NOTE** if you are on ServiceMix 4.5 then you should install hawtio-core instead of hawtio, eg

    features:addurl mvn:io.hawt/hawtio-karaf/1.2-M27/xml/features
    features:install hawtio-core

### If you use a HTTP proxy

If you are behind a http proxy; you will need to enable HTTP Proxy support in Fuse / Karaf / ServiceMix to be able to download hawtio from the central maven repository.

There are a few [articles about](http://mpashworth.wordpress.com/2012/09/27/installing-apache-karaf-features-behind-a-firewall/) [this](http://stackoverflow.com/questions/9922467/how-to-setup-a-proxy-for-apache-karaf) which may help. Here are the steps:

Edit the **etc/org.ops4j.pax.url.mvn.cfg** file and make sure the following line is uncommented:

    org.ops4j.pax.url.mvn.proxySupport=true

You may also want **org.ops4j.pax.url.mvn.settings** to point to your Maven settings.xml file. **NOTE** use / in the path, not \.

    org.ops4j.pax.url.mvn.settings=C:/Program Files/MyStuff/apache-maven-3.0.5/conf/settings.xml

Fuse / Karaf / ServiceMix will then use your [maven HTTP proxy settings](http://maven.apache.org/guides/mini/guide-proxies.html) from your **~/.m2/settings.xml** to connect to the maven repositories listed in **etc/org.ops4j.pax.url.mvn.cfg** to download artifacts.

If you're still struggling getting your HTTP proxy to work with Fuse, try jump on the [Fuse Form and ask for more help](https://community.jboss.org/en/jbossfuse).

## Other containers

The following section gives details of other containers

### Enable JMX on Jetty 8.x

If you are using Jetty 8.x then JMX may not enabled by default, so make sure the following line is not commented out in **jetty-distribution/start.ini** (you may have to uncomment it to enable JMX).

    etc/jetty-jmx.xml

### If you use JBoss AS 6.x

If you use JBoss AS 7.x or later or use EAP 6.x or later the above should just work.

However for JBoss AS 6.x or earlier there is [an issue with using newer versions of slf4j](http://totalprogus.blogspot.co.uk/2011/06/javalanglinkageerror-loader-constraint.html) so you must use <a class="btn" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-no-slf4j/1.2-M27/hawtio-no-slf4j-1.2-M27.war">Download hawtio-no-slf4j.war</a>.

To disable security [configure the system properties](http://www.mastertheboss.com/jboss-configuration/how-to-inject-system-properties-into-jboss) by adding the following to your **jboss-as/server/default/deploy/properties-service.xml** file (which probably has the mbean definition already but commented out):

    <mbean code="org.jboss.varia.property.SystemPropertiesService"
     name="jboss:type=Service,name=SystemProperties">

      <attribute name="Properties">
            hawtio.authenticationEnabled=false
      </attribute>
    </mbean>


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

## Further Reading

* [Articles and Demos](http://hawt.io/articles/index.html)
* [FAQ](http://hawt.io/faq/index.html)
* [How to contribute](http://hawt.io/contributing/index.html)
* [Join the hawtio community](http://hawt.io/community/index.html)
