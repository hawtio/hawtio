# hawtio Plugins

**hawtio** is highly modular with lots of plugins (see below), so that hawtio can discover exactly what services are inside a JVM and dyanmically update the console to provide an interface to them as things come and go. So after you have deployed hawtio into a container, as you add and remove new services to your JVM the hawtio console updates in real time.

For more details see [how hawtio plugins work](http://hawt.io/plugins/howPluginsWork.html).

## Included Plugins

You can see the [source for the default plugins here](https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app).

So far we have plugins for:

* [Apache ActiveMQ](http://activemq.apache.org/)
* [Apache Camel](http://camel.apache.org/)
* [Apache OpenEJB](http://openejb.apache.org/)
* [Apache Tomcat](http://tomcat.apache.org/)
* Dashboard plugin for creating reusable dashboard user interfaces which are then stored and versioned as JSON files in a git repository
* [Fuse Fabric](http://fuse.fusesource.org/fabric/)
* [Health MBeans](http://hawt.io/plugins/health/)
* [JBoss](http://www.jboss.org/jbossas)
* [Jetty](http://www.eclipse.org/jetty/)
* JMX
* [Logs](http://hawt.io/plugins/logs/)
* OSGi
* Wiki plugin for creating, editing and viewing text files (Markdown, HTML, XML) which are then versioned and stored in a git repository



## External plugins

If you create a new external plugin to hawtio please fork this repository and update this file to add a link to your plugin and [submit a pull request](http://hawt.io/contributing/index.html).