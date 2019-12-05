# Hawtio branding plugin example

[branding-plugin](https://github.com/hawtio/hawtio/tree/master/examples/branding-plugin) demonstrates how you can customise the application branding information such as title and logo, as well as login page information, through Hawtio plugin mechanism.

The important bits are:

- **`pom.xml`** -- When building plugins with Maven there is a few nice tricks that can be used to ease the build process. Have a look in this project's `pom.xml` to see how the build filters the `web.xml` and uses the `maven-antrun-plugin` to discover JavaScript files. The project creates a war file that can be deployed in various application services and is also OSGi-ified so it deploys nicely into Apache Karaf.

- **`src/main/webapp/plugin/brandingPlugin.js`** -- This is the main entry point of the plugin, and well, it is the only plugin JavaScript file. It defines a JavaScript module called `Branding` and an AngularJS (1.x) module called `branding-plugin` and pass the AngularJS module name to Hawtio's plugin loader. It doesn't define any component other than running module initialisation where it overwrites `hawtconfig.json`. Besides the `hawtioPluginLoader` call, this is mostly fairly standard AngularJS stuff.

## Installation

### Apache Tomcat / Jetty

Copy the simple-plugin war file as the following name

    branding-plugin.war

to the `deploy` directory of Apache Tomcat / Jetty as similar Java web container.

### Apache Karaf / Red Hat Fuse (on Karaf)

From the CLI type:

    install -s mvn:io.hawt/branding-plugin/2.8.0/war

(Substitute `2.8.0` with the version of choice.)

### Spring Boot

For Spring Boot, you don't need an extra plugin war like this example to customise `hawtconfig.json`. You can simply put `hawtconfig.json` file into the Spring Boot application to overwrite the information.

See [Spring Boot Authentication example](https://github.com/hawtio/hawtio/tree/master/examples/springboot-authentication) instead for more details.
