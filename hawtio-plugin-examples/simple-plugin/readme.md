# hawtio simple plugin example

simple-plugin is an introduction to writing a standalone hawtio plugin that can be deployed in a server alongside the main hawtio-web application.

The important bits are:

**pom.xml** - When building plugins with maven there's a few nice tricks that can be used to ease the build process.  Have a look in this project's pom.xml to see how the build filters the web.xml and uses the maven-antrun-plugin to discover javascript files.  The project creates a war file that can be deployed in various application services and is also OSGi-ified so it deploys nicely into Apache Karaf.

**src/main/webapp/plugin/js/simplePlugin.js** - This is the main entry point of the plugin, and well, it's the only plugin javascript file.  It defines a javascript module called "Simple" and an angular module called "simple_plugin" and pass the angular module name to hawtio's plugin loader.  It also defines the one page in the plugin and the controller used by this page.  Besides the hawtioPluginLoader call this is mostly fairly standard angularjs stuff.

**src/main/webapp/plugin/css/simple.css** - This CSS file doesn't have much but changes the layout of the plugin's page.  It's dynamically loaded in the simple-plugin's run() function at bootstrap.

**src/main/webapp/plugin/html/simple.html** - This plugin's HTML template that is used to render the page in hawtio.  This page shows a couple variables in the page controller's scope that are set on the fly when the HTML is rendered.  Fairly standard angularjs stuff as well.

## Apache Tomcat installation

Copy the simple-plugin war file as the following name

    simple-plugin.war

to the deploy directory of Apache Tomcat os similar Java web container.

## Apache Karaf/ServiceMix/JBoss Fuse/fabric8 installation

From the CLI type:

    install -s mvn:io.hawt/simple-plugin/1.5-SNAPSHOT/war

(substitute 1.5-SNAPSHOT with the version of choice)
