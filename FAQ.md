## General Questions

General questions on all things hawtio.

### What is the license?

hawtio uses the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0.txt).

### What does hawtio do?

It's a [pluggable](http://hawt.io/plugins/index.html) management console for Java stuff which supports any kind of JVM, any kind of container (Tomcat, Jetty, Karaf, JBoss, Fuse Fabric, etc), and any kind of Java technology and middleware.

### How do I configure hawtio?

Mostly hawtio just works. However, please check out the [Configuration Guide](https://github.com/hawtio/hawtio/blob/master/doc/Configuration.md) to see what kinds of things you can configure via system properties, environment variables, web.xml context-params or dependency injection.

### How do I install hawtio?

See the [getting started guide](https://github.com/hawtio/hawtio#get-started) which is on the home page (if you keep scrolling down).

### Why does hawtio have its own wiki?

At first a git-based wiki might not seem terribly relevant to hawtio. A wiki can be useful to document running systems and link to the various consoles, operational tools and views. Though in addition to being used for documentation, hawtio's wiki also lets you view and edit any text file; such as Camel routes, Fuse Fabric profiles, Spring XML files, Drools rulebases, etc.

From a hawtio perspective though its wiki pages can be HTML or Markdown and then be an AngularJS HTML partial. So it can include JavaScript widgets; or it can include [AngularJS directives](http://docs.angularjs.org/guide/directive).

This lets us use HTML and Markdown files to define custom views using HTML directives (custom tags) from any any [hawtio plugins](http://hawt.io/plugins/index.html). Hopefully over time we can build a large library of HTML directives that folks can use inside HTML or Markdown files to show attribute values or charts from MBeans in real time, to show a panel from a dashboard, etc. Then folks can make their own mashups and happy pages showing just the information they want.

So another way to think of hawtio wiki pages is as a kind of plugin or a custom format of a dashboard page. Right now each dashboard page assumes a grid layout of rectangular widgets which you can add to and then move around. However with a wiki page you can choose to render whatever information & widgets you like in whatever layout you like. You have full control over the content and layout of the page!

Here are some [sample](https://github.com/hawtio/hawtio/issues/103) [issues](https://github.com/hawtio/hawtio/issues/62) on this if you want to help!

So whether the hawtio wiki is used for documentation, to link to various hawtio and external resources, to create custom mashups or happy pages or to provide new plugin views--all the content of the wiki is audited, versioned and stored in git so it's easy to see who changed what, when and to roll back changes, etc.

### How do I build the project?

If you just want to run hawtio in a JVM then please see the [Getting Started](http://hawt.io/) section.

If you want to hack the source code then check out [how to build hawtio](http://hawt.io/building/index.html).

### What code conventions do you have?

Check out the [Coding Conventions](https://github.com/hawtio/hawtio/blob/master/doc/CodingConventions.md) for our recommended approach.

## Plugin Questions

Questions on writing or using the available plugins

<a id="pluginList"><h3>What plugins are available?</h3></a>

You can see the [default plugins here](https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app).

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
* [Logs](http://hawt.io/logs/)
* OSGi
* Wiki plugin for creating, editing and viewing text files (Markdown, HTML, XML) which are then versioned and stored in a git repository

### What can my new plugin do?

Anything you like :). So long as it runs on a web browser, you're good to go. Please start [contributing](http://hawt.io/contributing/index.html)!

### Do I have to use TypeScript?

You can write hawtio plugins in anything that runs in a browser and ideally compiles to JavaScript. So use pure JavaScript,  CoffeeScript, EcmaScript6-transpiler, TypeScript, GWT, Kotlin, Ceylon, ClojureScript, ScalaJS and [any language that compiles to JavaScript](http://altjs.org/).

So take your pick; the person who creates a plugin can use whatever language they prefer, so please contribute a [new plugin](http://hawt.io/contributing/index.html) :).

The only real APIs a plugin needs to worry about are AngularJS (if you want to work in the core layout rather than just be an iframe), JSON (for some pretty trivial extension points such as adding new tabs), HTML and CSS.

### How can I add my new plugin?

Check out [how plugins work](http://hawt.io/plugins/index.html). You can then either:

* Fork this project and submit your plugin by [creating a Github pull request](https://help.github.com/articles/creating-a-pull-request) then we'll include your plugin by default in the hawtio distribution.
* Make your own WAR with your plugin added (by depending on the hawtio-web.war in your pom.xml)
* Host your plugin at some canonical website (e.g. with Github pages) then [submit an issue](https://github.com/hawtio/hawtio/issues?state=open) to tell us about it and we can add it to the plugin registry JSON file.