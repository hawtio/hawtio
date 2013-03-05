# hawtio Plugins

**hawtio** is highly modular with lots of plugins (see below), so that hawtio can discover exactly what services are inside a JVM and dyanmically update the console to provide an interface to them as things come and go. So after you have deployed hawtio into a container, as you add and remove new services to your JVM the hawtio console updates in real time.

For more details see [how hawtio plugins work](http://hawt.io/plugins/howPluginsWork.html).

## Included Plugins

The following plugins are all included by default in the [hawtio-web.war](https://oss.sonatype.org/content/repositories/public/io/hawt/hawtio-web/1.0/hawtio-web-1.0.war) distro. You can see the [source for the all default plugins here](https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app).


<table class="table">
  <tr>
    <th>Plugin</th>
    <th>Description</th>
    <th>Source</th>
  </tr>
  <tr>
    <td>activemq</td>
    <td>Adds support for <a href="http://activemq.apache.org/">Apache ActiveMQ</a>. Lets you browse broker statistics, create queues/topcs, browse queues, send messages and visualise subscription and network information</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/activemq">activemq</a></td>
  </tr>
  <tr>
    <td>camel</td>
    <td>Adds support for <a href="http://camel.apache.org/">Apache Camel</a>. Lets you browse CamelContexts, routes, endpoints. Visualise running routes and their metrics. Create endpoints. Send messages. Trace message flows.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/camel">camel</a></td>
  </tr>
  <tr>
    <td>core</td>
    <td>Provides the core plugin mechanisms.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/core">core</a></td>
  </tr>
  <tr>
    <td><a href="http://hawt.io/plugins/dashboard/">dashboard</a></td>
    <td>Provides some default dashboards for viewing graphs, metrics and other widgets on a customisable tabbed view. You can create your own dashboards; they are
    stored and versioned as JSON files in a git repository so that you can easily share them on <a href="http://github.com/">github</a>.
    The default configuration repository <a href="https://github.com/hawtio/hawtio-config">is here</a></td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/dashboard">dashboard</a></td>
  </tr>
  <tr>
    <td>fabric</td>
    <td>Adds support for <a href="http://fuse.fusesource.org/fabric/">Fuse Fabric</a> such as to view profiles, versions and containers in your fabric and view/edit the profile configuration in git.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/fabric">fabric</a></td>
  </tr>
  <tr>
    <td>git</td>
    <td>Provides the HTML5 front end to the back end <a href="http://git-scm.com/">git repository</a> used to store configuration and files in plugins
    such as <a href="http://hawt.io/plugins/dashboard/">dashboard</a> and <a href="http://hawt.io/plugins/wiki/">wiki</a>. Uses the
    <a href="https://github.com/hawtio/hawtio/blob/master/hawtio-git/src/main/java/io/hawt/git/GitFacadeMXBean.java#L26">GitFacadeMXBean</a> from the <a href="https://github.com/hawtio/hawtio/tree/master/hawtio-git">hawtio-git module</a></td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/git">git</a></td>
  </tr>
  <tr>
    <td><a href="http://hawt.io/plugins/health/">health</a></td>
    <td>Adds support for <a href="http://hawt.io/plugins/health/">Health MBeans</a> so its easy to see the health of systems which support them
    (such as <a href="http://activemq.apache.org/">Apache ActiveMQ</a> and <a href="http://fuse.fusesource.org/fabric/">Fuse Fabric</a></td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/health">health</a></td>
  </tr>
  <tr>
    <td>jboss</td>
    <td>Adds support for <a href="http://www.jboss.org/jbossas">JBoss</a> such as viewing, starting, stopping, refreshing web applications, view connectors and JMX etc.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/jboss">jboss</a></td>
  </tr>
  <tr>
    <td>jetty</td>
    <td>Adds support for <a href="http://www.eclipse.org/jetty/">Jetty</a> such as viewing, starting, stopping, refreshing web applications, view connectors and JMX etc.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/jetty">jetty</a></td>
  </tr>
  <tr>
    <td>jmx</td>
    <td>Provides the core <a href="http://www.oracle.com/technetwork/java/javase/tech/javamanagement-140525.html">JMX</a> support for interacting with MBeans, viewing real time attributes, charting and invoking operations.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/jmx">jmx</a></td>
  </tr>
  <tr>
    <td>karaf</td>
    <td>Adds support for <a href="http://karaf.apache.org/">Apache Karaf</a> so you can browse features, bundles, services and configuration.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/karaf">karaf</a></td>
  </tr>
  <tr>
    <td><a href="http://hawt.io/plugins/logs/">log</a></td>
    <td>Provides support for visualising the <a href="http://hawt.io/plugins/logs/">logs</a> inside the JVM along with linking log statements to the source code which generates them. <i>Hawt!</i></td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/log">log</a></td>
  </tr>
  <tr>
    <td>openejb</td>
    <td>Adds support for <a href="http://openejb.apache.org/">Apache OpenEJB</a></td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/openejb">openejb</a></td>
  </tr>
  <tr>
    <td>osgi</td>
    <td>Provides support for <a href="http://www.osgi.org/Main/HomePage">OSGi containers</a> such as <a href="http://karaf.apache.org/">Apache Karaf</a> using the standard OSGi management hooks.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/osgi">osgi</a></td>
  </tr>
  <tr>
    <td>source</td>
    <td>Used by the <a href="http://hawt.io/plugins/logs/">log plugin</a> to view the source code of any file in a maven source artefact using the maven coordinates, class name / file name and line number.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/source">source</a></td>
  </tr>
  <tr>
    <td>tomcat</td>
    <td>Adds support for <a href="http://tomcat.apache.org/">Apache Tomcat</a> such as viewing, starting, stopping, refreshing web applications, view connectors and JMX etc.</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/tomcat">tomcat</a></td>
  </tr>
  <tr>
    <td><a href="http://hawt.io/plugins/wiki/">wiki</a></td>
    <td>Provides a git based wiki for viewing, creating and editing text files (Markdown, HTML, XML, property files, JSON) which are then versioned and stored in a git repository</td>
    <td><a href="https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/wiki">wiki</a></td>
  </tr>
</table>


## External plugins

<table class="table">
  <tr>
    <th>Plugin</th>
    <th>Source</th>
    <th>Description</th>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>

If you create a new external plugin to hawtio please fork this repository and update this file to add a link to your plugin and [submit a pull request](http://hawt.io/contributing/index.html).