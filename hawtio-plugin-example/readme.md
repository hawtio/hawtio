# hawtio plugin loader

So `../hawtio-plugin-registry` is the backend service that is a simple blueprint reference listener that registers and unregisters services implementing the Plugin interface into JMX.  This allows the registry to be easily advertised via jolokia using the URL:

    http://host:port/jolokia/read/hawtio:type=plugin,name=*

The return value is a list of plugin objects, each object (at the moment) has a name, the context under which the plugin is available, what JMX domain the plugin could handle (up for debate) and an array of scripts that should be loaded.

Example :
```javascript
{
   "timestamp":1358365918,
   "status":200,
   "request":{
      "mbean":"hawtio:name=*,type=plugin",
      "type":"read"
   },
   "value":{
      "hawtio:name=simple-plugin-two,type=plugin":{
         "Name":"simple-plugin-two",
         "Context":"\/hawtio\/simple-plugin-two",
         "Domain":"",
         "Scripts":[
            "app\/js\/app.js"
         ]
      },
      "hawtio:name=simple-plugin-one,type=plugin":{
         "Name":"simple-plugin-one",
         "Context":"\/hawtio\/simple-plugin",
         "Domain":"",
         "Scripts":[
            "app\/js\/app.js"
         ]
      }
   }
}
```

These plugins will be automatically loaded by the main hawt.io application, which controls both the main entry point of plugins into the application and for bootstrapping angular. The main hawt.io application contains a jquery plugin that queries the backend plugin registry and downloads and runs all of the plugin scripts, calling on the angular bootstrap process at the right time.

## So, wtf is going on?

The hawt.io application contains a plugin loader that will query jolokia or other URLs that point to json files configured like [this one](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/test.json).

In the document.ready() function we call plugin_loader.loadPlugins and pass a callback to be executed after all available plugins are loaded.  In this callback we add our main module, then pass the whole list of modules to angular.bootstrap, letting angular take over loading our application.  Most importantly for integration testing we also add ng-app to the HTML document root.

## wtf is a plugin?

A plugin has two parts.  The first is a blueprint.xml file that exports a service that uses the io.hawt.web.plugin.Plugin interface found in ../hawtio-plugin-registry.  The hawtio-plugin-registry module also contains a SimplePlugin class that folks can wire up without having to write any java code.  If you have a look at the pom.xml of the simple_plugin example you'll see properties like:

```xml
<!-- filtered plugin properties -->
<plugin-context>/hawtio/simple-plugin-two</plugin-context>
<plugin-name>${project.artifactId}</plugin-name>
<plugin-domain></plugin-domain>
<plugin-scripts>app/js/app.js</plugin-scripts>
```
So the blueprint xml is just filtered by maven to use these values.

The other part of the plugin is the frontend javascript code.  A plugin can just be an angular.js module, and you can declare that module has dependencies on other angular modules such as main, or other plugins even.

```javascript
angular.module('simple_plugin', ['main'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/simple_plugin', {
```

angular still handles the dependencies as all plugins are passed to the angular bootstrap method.  One thing to note is that you have to tell our plugin loader what the module name is:

```javascript
$.plugin_loader.addModule('simple_plugin');
```

Now, hawtio will monitor the hawtio/registry mbean which maintains a counter that changes whenever a plugin is loaded or unloaded.  If you've turned on auto-refresh in your hawtio preferences panel, whenever a new plugin is loaded or an existing plugin is reloaded the UI will refresh.  This allows a plugin developer to simply continue re-deploying the plugin war and the front end automatically picks up the changes not unlike using live reload.

