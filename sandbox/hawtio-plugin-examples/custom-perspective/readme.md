# Custom Perspective Plugin Example

This plugin is a simple example that shows how you can reconfigure hawtio's perspective plugin to hide tabs in the UI.  It's also possible to create new perspectives so you can move tabs to other perspectives as well.

This plugin also shows how to use a context listener to initialize it's JMX MBean, rather than using a blueprint XML file like the simple-plugin example, so there's no requirement for OSGi or blueprint to run this plugin.  It just needs to be deployed alongside hawtio-web and creates a web context at /hawtio/custom-perspective to serve out it's javascript file.

The plugin also includes some logging so you can see what the original perspective definition is, what tabs are currently available and then finally what the plugin has modified the perspective definition to.  To see this logging, go into hawtio's user preferences (in the user menu at the top-right) and make sure you've set "Log Level" to "Debug".  You can see the logging either in hawtio's drop-down console or in your browser's javascript console.

So by default the plugin just excludes the "Connect" and "Dashboard" tabs"

```
window['Perspective']['metadata'] = {
  container: {
    label: "Container",
    lastPage: "#/help",
    topLevelTabs: {
      excludes: [
        {
          href: "#/dashboard"
        },
        {
          href: "#/jvm"
        }
      ]
    }
  }
};
```

But you could also add additional perspectives:

```
    window['Perspective']['metadata'] = {
      mystuff: {
        label: "MyStuff",
        lastPage: "#/log",
        topLevelTabs: {
          includes: [
            {
              href: "#/log"
            }
          ]
        }
      },
      container: {
        label: "Container",
        lastPage: "#/help",
        topLevelTabs: {
          excludes: [
            {
              href: "#/dashboard"
            },
            {
              href: "#/jvm"
            }
          ]
        }
      }
    };
```

The "lastPage" attribute is how the perspective plugin keeps track of the last tab the user was on when switching perspectives, so effectively this will be the default/starting tab of that perspective.

## Apache Karaf/ServiceMix/JBoss Fuse/fabric8 installation

The plugin does still define an Import-Package so it can be deployed into Apache Karaf by dropping it into the "deploy" directory or doing something like:

    install -s mvn:io.hawt/custom-perspective/1.5-SNAPSHOT/war

(substitute 1.5-SNAPSHOT with the version of choice)

For other app servers you may need to add whatever app server specific configuration is necessary to get the plugin's context root to be `/hawtio/custom-perspective`, otherwise you'll need to edit `PluginContextListener.java` to specify the context the plugin is at and rebuild so that hawtio can find the plugin's javascript file.


