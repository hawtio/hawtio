# hawtio simple plugin example

simple-plugin is an introduction to writing a standalone hawtio plugin that can be deployed in a server alongside the main hawtio-web application.

The important bits are:

**src/main/webapp/plugin/js/simplePlugin.js** - This is the main entry point of the plugin, and well, it's the only file.  It defines a javascript module called "Simple" and an angular module called "simple_plugin" and pass the angular module name to hawtio's plugin loader.  It also defines the one page in the plugin and the controller used by this page.
