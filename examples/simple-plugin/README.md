# Hawtio simple plugin example

[simple-plugin](https://github.com/hawtio/hawtio/tree/main/examples/simple-plugin) is an introduction to writing a standalone Hawtio plugin that can be deployed in a server alongside the main `hawtio.war` application.

The important bits are:

- **`pom.xml`** -- When building plugins with Maven there is a few nice tricks that can be used to ease the build process. Have a look in this project's `pom.xml` to see how the build filters the `web.xml` and uses the `maven-antrun-plugin` to discover JavaScript files. The project creates a war file that can be deployed in various application services and is also OSGi-ified so it deploys nicely into Apache Karaf.

- **`src/main/webapp/plugin/simplePlugin.js`** -- This is the main entry point of the plugin, and well, it is the only plugin JavaScript file. It defines a JavaScript module called `Simple` and an AngularJS (1.x) module called `simple-plugin` and pass the AngularJS module name to Hawtio's plugin loader. It also defines the one component (= HTML template + controller) used in the plugin. Besides the `hawtioPluginLoader` call, this is mostly fairly standard AngularJS stuff.

## Installation

### WildFly / Apache Tomcat / Jetty

Copy the simple-plugin war file as the following name:

    simple-plugin.war

to the `standalone/deployments/` directory of WildFly or the `deploy/` directory of Apache Tomcat / Jetty.

### Apache Karaf / Red Hat Fuse (on Karaf)

From the CLI type:

    install -s mvn:io.hawt/simple-plugin/2.8.0/war

(Substitute `2.8.0` with the version of choice.)

### Spring Boot

For Spring Boot, you don't need an extra war like this example to deploy a custom plugin. There is a better way, and you can directly put a JavaScript plugin into the Spring Boot application to extend Hawtio features.

See [Spring Boot example](https://github.com/hawtio/hawtio/tree/main/examples/springboot) instead for more details.
