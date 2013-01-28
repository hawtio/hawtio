## General Questions

General questions on all things hawtio

### What is the license?

hawtio uses the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.txt)

### What does hawtio do?

Its a [pluggable](http://hawt.io/developers/plugins.html) management console for Java stuff which supports any kind of JVM, any kind of container (Tomcat, Jetty, Karaf, JBoss, Fuse Fabric etc) and any kind of Java technology and middleware.

### How do I build the project

If you just want to run hawtio in a JVM then please see the [getting started section](http://hawt.io/).

If you want to hack the source code then check out [how to build hawtio](http://hawt.io/building/index.html)


## Plugin Questions

Questions on writing or using the available plugins

### What plugins are available?

You can see the [default plugins here](https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app). So far we have plugins for:

* [Apache ActiveMQ](http://activemq.apache.org/)
* [Apache Camel](http://camel.apache.org/)
* [Apache OpenEJB](http://openejb.apache.org/)
* [Apache Tomcat](http://tomcat.apache.org/)
* [Fuse Fabric](http://fuse.fusesource.org/fabric/)
* [Health MBeans](http://hawt.io/health/)
* [JBoss](http://www.jboss.org/jbossas)
* [Jetty](http://www.eclipse.org/jetty/)
* JMX
* Logging
* OSGi

### What can my new plugin do?

Anything you like :). So long as it runs on a web browser, you're good to go. Please start [contributing](http://hawt.io/contributing/index.html)!

### Do I have to use TypeScript?

You can write hawtio plugins in anything that runs in a browser and ideally compiles to JavaScript. So use pure JavaScript,  CoffeeScript, EcmaScript6-transpiler, TypeScript, GWT, Kotlin, Ceylon, ClojureScript, ScalaJS and [any language that compiles to JavaScript](http://altjs.org/).

So take your pick; the person who creates a plugin can use whatever language they prefer, so please contribute a [new plugin](http://hawt.io/contributing/index.html) :).

The only real APIs a plugin needs to worry about are AngularJS (if you want to work in the core layout rather than just be an iframe), JSON for some pretty trivial extension points like adding new tabs and HTML & CSS.

### How can I add my new plugin?

Check out [how plugins work](http://hawt.io/developers/plugins.html). You can then either:

* fork this project and submit your plugin by [creating a github pull request](https://help.github.com/articles/creating-a-pull-request) then we'll include your plugin by default in the hawtio distro
* make your own WAR with your plugin added (by depending on the hawtio-web.war in your pom.xml)
* host your plugin at some canonical website (e.g. with github pages) then [submit an issue](https://github.com/hawtio/hawtio/issues?state=open) to tell us about it and we can add it to the plugin registry JSON file.