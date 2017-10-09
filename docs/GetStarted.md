You can use hawtio from a Chrome Extension or in many different containers - or outside a container in a stand alone executable jar. Below are all the various options for running hawtio. To see whats changed lately check out the <a class="btn btn-default" href="http://hawt.io/changelog.html">change log</a>

The Hawtio platform consists of 2 parts, the backend which is running in a Java Web Container the Jolokia gateway (JMX to JSON) and the front end containing the Angular, D3, ... Javascript to do the rendering of the JSON responses in a very nice way. 
Depending how you plan to use Hawtio for your project in your environment, you can run the backend using a [java standalone jar](#standalone), [a servlet engine](#web-container), [application server](#jee) or [an OSGI container](#osgi).
If you do not use a servlet container or application server, you can also embed the hawtio backend [inside your process](#embedded).
 
The front end could be accessed using the **HTML5 web console** or from [Google Browser](#chrome-ext)

The out of the box defaults try to do the right thing for most folks but if you want to configure things then please check out the <a class="btn btn-default" href="http://hawt.io/configuration/index.html">configuration guide</a>

<a name="standalone"></a>
## Using the executable jar

You can startup hawtio on your machine using the hawtio-app executable jar.

<a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-app/1.5.4/hawtio-app-1.5.4.jar">Download the executable hawtio-app-1.5.4.jar</a>

Once you have downloaded it, just run this from the command line:

    java -jar hawtio-app-1.5.4.jar

Note: If you launch hawt.io with Java 9, add the specified modules to avoid errors on startup and allow attaching to other Java processes:

    java --add-modules jdk.attach,java.xml.bind -jar hawtio-app-1.5.4.jar

And the console should show you which URL to open to view hawtio; which by default is [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/)

You can specify the port number to use, for example to use port 8090 run from the command line:

    java -jar hawtio-app-1.5.4.jar --port 8090

hawtio supports other options which you can get listed by running from command line:

    java -jar hawtio-app-1.5.4.jar --help

<a name="web-container"></a>
## Using a Servlet Engine or Application Server

If you are running Tomcat, Jetty you could just deploy a WAR:
(JBoss AS or Wildfly users see other containers section further below)

<b>TIP:</b> You may want to use the offline deployment which do not connects to the internet for plugins such as Maven and Git.

<div class="row">
  <div class="col-md-6 span6 text-center">
    <p>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-default/1.5.4/hawtio-default-1.5.4.war">Download hawtio-default.war</a>
    </p>
    <p>
      a bare hawtio web application with minimal dependencies (online mode connecting to the internet for the Maven and Git plugin)
    </p>
  </div>
  <div class="col-md-6 span6 text-center">
    <p>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-default-offline/1.5.4/hawtio-default-offline-1.5.4.war">Download hawtio-default-offline.war</a>
    </p>
    <p>
      a bare <b>offline</b> hawtio web application with minimal dependencies in offline mode, where Maven and Git plugins are not enabled.
    </p>
  </div>
  <div class="col-md-6 span6 text-center">
    <p>
      <a class="btn btn-large  btn-primary" href="https://oss.sonatype.org/content/repositories/public/io/hawt/sample/1.5.4/sample-1.5.4.war">Download sample.war</a>
    </p>
    <p>
      a hawtio web application which comes with some <a href="http://activemq.apache.org/">Apache ActiveMQ</a> and
      <a href="http://camel.apache.org/">Apache Camel</a> to play with which is even <i>hawter</i>
    </p>
  </div>
</div>

Copy the WAR file to your deploy directory in your container.

If you rename the downloaded file to _hawtio.war_ then drop it into your deploy directory then open [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) and you should have your hawtio console to play with.

Otherwise you will need to use either [http://localhost:8080/hawtio-default-1.5.4/](http://localhost:8080/hawtio-default-1.5.4/) or [http://localhost:8080/sample-1.5.4/](http://localhost:8080/sample-1.5.4/)  depending on the file name you downloaded.

Please check [the configuration guide](http://hawt.io/configuration/index.html) to see how to configure things; in particular security.


If you don't see a Tomcat / Jetty tab for your container you may need to enable JMX.

<a name="osgi"></a>
## Using JBoss Fuse

If you are using 6.1 or later of [JBoss Fuse](http://www.jboss.org/products/fuse), then hawtio is installed out of the box

## Using Apache Karaf or Apache ServiceMix

By default installing `hawtio` installs the Maven and Git plugin which uses online connection over the internet to work. You may want to install `hawtio-offline` instead which disables those plugins, and runs hawtio without any internet connectivity. When installing `hawtio-core` then those plugins are not installed and its also in offline mode.

If you are using [Apache Karaf](http://karaf.apache.org/) 2.x:

    features:chooseurl hawtio 1.5.4
    features:install hawtio

If you are using [Apache Karaf](http://karaf.apache.org/) 3.x:

    feature:repo-add hawtio 1.5.4
    feature:install hawtio-core

If you are using [Apache Karaf](http://karaf.apache.org/) 4.x:

    feature:repo-add hawtio 1.5.4
    feature:install hawtio

If you are using [Apache ServiceMix](http://servicemix.apache.org/) 5.x/6.x:

    feature:repo-add hawtio 1.5.4
    feature:install hawtio-core

If you are using [Apache ServiceMix](http://servicemix.apache.org/) 7.x:

    feature:repo-add hawtio 1.5.4
    feature:install hawtio



**NOTE** Karaf 2.x/3.x has an issue with the `hawtio-log` and `hawtio-terminal` which does not work. And therefore you need to install `hawtio-core` instead of `hawtio`. 

The hawtio console can then be viewed at [http://localhost:8181/hawtio/](http://localhost:8181/hawtio/). The default login for Karaf is `karaf/karaf`, and for ServiceMix its `smx/smx`.


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

<a name="jee"></a>
### If you use JBoss AS or Wildfly

You may have issues with slf4j JARs in WAR deployments on JBoss AS or Wildfly. To resolve this you must use <a class="btn-default" href="https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-no-slf4j/1.5.4/hawtio-no-slf4j-1.5.4.war">Download hawtio-no-slf4j.war</a>.

See more details [here](http://totalprogus.blogspot.co.uk/2011/06/javalanglinkageerror-loader-constraint.html).

Additionally related to logging, you can remove the log4j.properties from the root of the classpath so that Wildlfy
uses its logging mechanisms instead of trying to use the embedded log4j. From the command line, you can
try:

    zip -d hawtio.war WEB-INF/classes/log4j.properties
    
Since hawtio does use some CDI beans, but does not deploy a beans.xml CDI descriptor, you can also relax
Wildfly's [implicit CDI detection](https://docs.jboss.org/author/display/WFLY8/CDI+Reference) by changing the 
Weld config to look like this:

        <system-properties>
            <property name="hawtio.authenticationEnabled" value="false" />
        </system-properties>
        
To enable security, you'll need to set you configuration up like this:

    <extensions>
        ...
    </extensions>
    
    <system-properties>
        <property name="hawtio.authenticationEnabled" value="true" />
        <property name="hawtio.realm" value="jboss-web-policy" />
        <property name="hawtio.role" value="admin" />
    </system-properties>
    
You can follow the [steps outlined in this blog](http://www.christianposta.com/blog/?p=403) for a more comprehensive
look at enabling security in Wildfly with hawtio.

If you experience problems with security, you would need to disable security in hawtio by [configure the system properties](http://www.mastertheboss.com/jboss-configuration/how-to-inject-system-properties-into-jboss) by adding the following to your **jboss-as/server/default/deploy/properties-service.xml** file (which probably has the mbean definition already but commented out):

    <mbean code="org.jboss.varia.property.SystemPropertiesService"
     name="jboss:type=Service,name=SystemProperties">

      <attribute name="Properties">
            hawtio.authenticationEnabled=false
      </attribute>
    </mbean>

Or in newer versions (Wildfly 8.1) you'll want to add this to standalone/configuration/standalone.xml:

    <extensions>
        ...
    </extensions>
    
    <system-properties>
        <property name="hawtio.authenticationEnabled" value="false" />
    </system-properties>

### Enable JMX on Jetty 8.x

If you are using Jetty 8.x then JMX may not enabled by default, so make sure the following line is not commented out in **jetty-distribution/start.ini** (you may have to uncomment it to enable JMX).

    etc/jetty-jmx.xml


<a name="embedded"></a>
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

<a name="chrome-ext"></a>
## Using the Chrome Extension (currently not working)

> Chrome Extension currently does not work, as Google requires extensions to be installed using their app store, and hawtio are not yet published to the app store. This may change in the future.

<a class="btn btn-large btn-primary" href="http://central.maven.org/maven2/io/hawt/hawtio-crx/1.4.47/hawtio-crx-1.4.47.crx">Download the hawtio Chrome Extension version 1.4.47</a>

* Then you'll need to open the folder that the CRX file got downloaded to. On a Mac in Chrome you right click the downloaded file and click <b>Show in Finder</b>

* now in <a href="https://www.google.com/intl/en/chrome/browser/">Google Chrome</a> open the <a class="btn btn-default btn-large" href="chrome://extensions/">Extensions Page</a> at <b>chrome://extensions/</b> or <b>Window pull down menu -&gt; Extensions</b>

* now drop the downloaded CRX file (from Finder or Windows Explorer) onto Chrome's <a href="chrome://extensions/">Extensions Page</a> at <b>chrome://extensions/</b> or <b>Window pull down menu -&gt; Extensions</b> and it should install the hawtio extension for Chrome.

* now to open a <a href="http://hawt.io/">hawtio</a> tab or window at any point, just open a new tab / window in Chrome, click the <b>Apps</b> button on the left hand of the bookmark bar which should open a window with all your extensions in there....

* you should see a <a href="http://hawt.io/">hawtio icon</a> in the apps page. If not <a href="http://hawt.io/community/index.html">let us know!</a>.

* Click the <a href="http://hawt.io/">hawtio icon</a>

* the <b>Connect</b> page should appear where you can then connect to any processes which are running a <a href="http://jolokia.org/">jolokia agent</a>.

* have fun and profit! Please share with us your <a href="http://hawt.io/community/index.html">feedback!</a> or <a href="https://twitter.com/hawtio">tweet us!</a>

## Using a git Clone

From a git clone you should be able to run the a sample hawtio console as follows:

    git clone git@github.com:hawtio/hawtio.git
    cd hawtio/sample
    mvn jetty:run

Then opening [http://localhost:8282/hawtio/](http://localhost:8282/hawtio/) should show hawtio with a sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is `java.lang/OperatingSystem`. Try looking at queues or Camel routes. Notice that as you change selections in the tree the list of tabs available changes dynamically based on the content.

## Using Third Party Plugins

**hawtio** is fully pluggable, and allows to integrate with custom plugins, as if they are out of the box. There is different approaches how you can install and use custom plugins with hawtio, which you can read more about at [How Plugin Works](http://hawt.io/plugins/howPluginsWork.html).

## Using hawtio Maven Plugins

**hawtio** offers a number of [Maven Plugins](http://hawt.io/maven/), so that users can bootup Maven projects and have hawtio embedded in the running JVM.

## Trying SNAPSHOT builds

The **hawtio** project has a CI server which builds and deploys daily builds to a [Maven repository](https://repository.jboss.org/nexus/content/repositories/fs-snapshots/io/hawt). For example to try the latest build of the 'hawtio-default' WAR you can
download it from the [Maven repository](https://repository.jboss.org/nexus/content/repositories/fs-snapshots/io/hawt/hawtio-default).


## Further Reading

* [Articles and Demos](http://hawt.io/articles/index.html)
* [FAQ](http://hawt.io/faq/index.html)
* [How to contribute](http://hawt.io/contributing/index.html)
* [Join the hawtio community](http://hawt.io/community/index.html)
