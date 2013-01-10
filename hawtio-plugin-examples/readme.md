# hawtio plugin loader

So ../hawtio-plugin-registry is the backend service that is a simple blueprint reference listener that registers and unregisters services implementing the Plugin interface into JMX.  This allows the registry to be easily advertised via jolokia using the URL:

http://host:port/jolokia/read/hawtio:type=plugin,name=*

the return value is a list of plugin objects, each object (at the moment) has a name, the context under which the plugin is available, what JMX domain the plugin could handle (up for debate) and an array of scripts that should be loaded.

The plugin-loader-frontend module would be the main webapp here and so controls the main entry point into the application, and most importantly is responsible for bootstrapping angular.  It also contains a jquery plugin that queries the backend plugin registry and downloads and runs all of the plugin scripts, calling on the angular bootstrap process at the right time.

## So, wtf is going on?

The index.html of plugin-loader-frontend brings in all the stuff in lib/, along with our plugin loader jquery plugin (guess I didn't really need to make this a jquery plugin persay, but there it is).  The app declares the "main" angular module, specifies a couple services and a constant that can be used by plugins to link back to the main page.

In the document.ready() function we call plugin_loader.loadPlugins and pass a callback to be executed after all available plugins are loaded.  In this callback we add our main module, then pass the whole list of modules to angular.bootstrap, letting angular take over loading our application.

## wtf is a plugin?

A plugin has two parts.  The first is a blueprint.xml file that exports a service that uses the io.hawt.web.plugin.Plugin interface found in ../hawtio-plugin-registry.  The hawtio-plugin-registry module also contains a SimplePlugin class that folks can wire up without having to write any java code.  And if you have a look at either pom.xml of the simple_plugin_* examples you'll see properties like:

```xml
<!-- filtered plugin properties -->
<plugin-context>/hawtio/simple-plugin-two</plugin-context>
<plugin-name>${project.artifactId}</plugin-name>
<plugin-domain></plugin-domain>
<plugin-scripts>app/js/app.js</plugin-scripts>
```
So the blueprint xml is just filtered by maven to use these values.

The other part of the plugin is the frontend javascript code.  A plugin can just be an angular.js module, and you can declare that module has dependencies on other angular modules such as main, or other plugins even.

```
angular.module('simple_plugin', ['main'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/simple_plugin', {
```

angular still handles the dependencies as all plugins are passed to the angular bootstrap method.  One thing to note is that you have to tell our plugin loader what the module name is:

```
$.plugin_loader.addModule('simple_plugin');
```

Another thing to note since both of these plugins are using the typescript compiler you can add interfaces for existing libraries in src/main/d.ts, most importantly you'd want the interface for the plugin loader, which you'll find in src/main.d.ts/jquery-plugin-loader.d.ts in the plugin-loader-frontend module.

## Building...

Okay, so at the moment you've gotta do "npm install" in plugin-loader-frontend, simple-plugin-one and simple-plugin-two (sucks).  Then build ../hawtio-plugin-registry and do an "mvn clean install" here in hawtio-plugin-examples to build all 3 modules.  The file "hawtio-plugin-registry.zip" is a profile export that installs all of the bundles.  So use the fabric distro and do:

fabric:create -p fmc

Then log into FMC, go to the "Profiles" tab and import the hawtio-plugin-registry.zip file.  The plugin loader frontend web application will be at:

http://localhost:8181/plugin-loader/index.html

You should see two links, simple_plugin_two and simple_plugin, each link takes you to a partial managed by a controller in that respective plugin.  The "back" link is provided by the main module to both plugins via the "home" constant.  If you do an osgi:list you'll see the 4 relevant bundles:

[ 353] [Active     ] [            ] [   60] hawt.io :: hawtio plugin loader frontend (1.0.0.SNAPSHOT)
[ 354] [Active     ] [Created     ] [   60] hawt.io :: Plugin Registry Backend (1.0.0.SNAPSHOT)
[ 355] [Active     ] [Created     ] [   60] hawt.io :: Simple plugin two (1.0.0.SNAPSHOT)
[ 356] [Active     ] [Created     ] [   60] hawt.io :: Simple plugini one (1.0.0.SNAPSHOT)

If you stop either Simple plugin bundle and refresh your browser, you'll see the link associated with that plugin disappear.  Restart the bundle and it'll reappear.




