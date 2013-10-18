# hawtio plugin architecture

So the main core of hawtio's plugin architecture is really the frontend plugin loader script.  It takes advantage of the fact that you can load up multiple angular.js modules to bootstrap an angular.js application.  The plugin loader can also load additional script files by configuring it with external URLs.

So a plugin is just an angular.js module.  You first define your angular.js module:

```javascript
// create our angular module and tell angular what route(s) it will handle
var simplePlugin = angular.module('simple_plugin', ['hawtioCore'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/simple_plugin', {
          templateUrl: '../hawtio/simple-plugin/app/html/simple.html'
        });
  })
```

And then tell the plugin loader that your module should be loaded:

```javascript
hawtioPluginLoader.addModule('simple_plugin');
```

In hawtio's core plugin we install a window onReady function to kick off the plugin loader and bootstrap angular.js:

```typescript
$(function () {
  hawtioPluginLoader.loadPlugins(function () {
    var doc = $(document);
    angular.bootstrap(doc, hawtioPluginLoader.getModules());
    $(document.documentElement).attr('xmlns:ng', "http://angularjs.org");
    $(document.documentElement).attr('ng-app', 'hawtioCore');
    adjustHeight();
    $(window).resize(adjustHeight);
  });
});
```

For hawtio we use a [simple servlet](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/java/io/hawt/web/PluginServlet.java#L45) to serve out some JSON of any plugins that are loaded in the JVM.  This servlet just looks in JMX, so basically if you can get your plugin to create an mbean under hawtio/plugins hawtio will load it.  In hawtio's core plugin we configure the hawtio plugin loader to fetch plugins from this servlet via:

```typescript
// bootstrap plugin loader
hawtioPluginLoader.addUrl("/hawtio/plugin");
```

Part of the reason we use a simple servlet to facade JMX is so that we can fetch the plugin list before we need to do authentication, as requests to jolokia are picked up by hawtio's authentication filter.

We've a few examples of dynamic plugins now:

* [The simple example plugin](https://github.com/hawtio/hawtio/tree/master/hawtio-plugin-examples/simple-plugin)
* [The hawtio-karaf-terminal plugin](https://github.com/hawtio/hawtio/tree/master/hawtio-karaf-terminal) - basically forked from the Apache Felix webconsole to avoid bringing in dependencies, this plugin also shows a simple example of how to load multiple scripts
* [insight-kibana](https://github.com/jboss-fuse/fuse/blob/master/insight/insight-kibana3/src/main/webapp/js/kibana3Plugin.js) - A more advanced example of a plugin that wraps the Kibana web front end for elastic search.  We pass a big list of scripts for the plugin loader to load as the webapp had loads of angular modules that needed to be available at bootstrap.  Here we're linking directly to the plugin, this webapp can also still run standalone.

All of these use a simple bean to register themselves in JMX, [hawtio-plugin-mbean](https://github.com/hawtio/hawtio/tree/master/hawtio-plugin-mbean).  This bean can be configured pretty easily via a blueprint.xml:

```xml
<blueprint xmlns="http://www.osgi.org/xmlns/blueprint/v1.0.0"
           xmlns:cm="http://aries.apache.org/blueprint/xmlns/blueprint-cm/v1.1.0">

  <bean id="plugin" class="io.hawt.web.plugin.HawtioPlugin" init-method="init" destroy-method="destroy">
    <property name="name" value="${plugin-name}"/>
    <property name="context" value="${plugin-context}"/>
    <property name="domain" value="${plugin-domain}"/>
    <property name="scripts" value="${plugin-scripts}"/>
  </bean>

</blueprint>
```

Most of the wars above just embed this bean.  Also in the above blueprint.xml the idea is that maven filtering is used to update these settings, so in the pom.xml of the maven project where the above blueprint.xml is used:

```xml
  <properties>
    <!-- filtered plugin properties -->
    <plugin-context>/hawtio/simple-plugin</plugin-context>
    <plugin-name>${project.artifactId}</plugin-name>
    <plugin-domain />
    <plugin-scripts>app/js/simplePlugin.js</plugin-scripts>
  </properties>
```
