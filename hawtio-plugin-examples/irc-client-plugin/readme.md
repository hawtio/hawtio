# hawtio IRC client plugin example

The irc-plugin-example module here shows that a hawtio plugin can be quite powerful.  In this case the plugin implements a full-blown IRC client that can connect to an IRC server (like chat.freenode.net) and support multiple channels, queries, etc.

The plugin also includes a third-party angularjs directive and shows how it's incorporated.  Also the plugin includes it's own CSS file for it's on UI and shows how that CSS file is loaded from the plugin's run method.

The important bits are:

**src/main/webapp/plugin/js/ircPlugin.js** - the main entry point of the plugin, this is where we declare our angular module and define the module's run method.  The run method starts up the IRC service in the background if so configured.  It also sets up the top-level tab and adds the plugin's CSS file.

**src/main/webapp/plugin/js/navbar.js** - A controller used to handle the sub-level tabs of the plugin and ensures that the user is routed to the settings tab if there's no IRC connection

**src/main/webapp/plugin/js/chat.js** - The controller that handles the chat UI

**src/main/webapp/plugin/js/settings.js** - The controller that handles the settings UI.  Uses hawtio-forms for the main form.

**src/main/java/io/hawt/example/ircplugin/PluginContextListener.java** - Here is where we initialize the mbean used by hawtio to discover our plugin.  We also create a second mbean to interact with the IRC service.

## Getting started with a simpler plugin

hawtio-simple-plugin is a good simple plugin to better understand how plugins are loaded dynamically by hawtio.

## Apache Tomcat installation

Copy the irc-client-plugin war file as the following name

    irc-plugin.war

to the deploy directory of Apache Tomcat os similar Java web container.

## Karaf/JBoss Fuse installation

From the CLI type:

    install -s mvn:io.hawt/irc-client-plugin/1.5-SNAPSHOT/war

(substitute 1.5-SNAPSHOT with the version of choice)
