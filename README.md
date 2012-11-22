# Fuse Web Console

The Fuse Web Console provides a web based console for working with [Fuse](http://fuse.fusesource.org/)

## Trying out the console from Maven

From a git clone you should be able to run the sample web console as follows:

    cd web-console
    mvn test-compile exec:java
    open http://localhost:8080/

That should run a little sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs aavailable changes dynamically based onthe content.

## Building with GruntJS

When developing the console, the most RAD tool for building the client side is [gruntjs](http://gruntjs.com/). We use it to automatically compile the [TypeScript](http://typescriptlang.org/) [source code](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/ts) for the web console into JavaScript for RAD development.

### Installing GruntJS

To build the code with gruntjs you will need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/)

Then to install grunt:

    npm install -g grunt

Then in the web-console directory you will need to install the grunt plugins required

    cd web/web-console
    npm install grunt-type

### Building with GruntJS

Its a simple matter of running 'grunt' :) By default this then watches for changes to the source files and auto-recompiles on the fly

    grunt

## Technology overview

For those interested in contributing, here is a low down of the various open source libraries used to build Fuse Console.

* [jolokia](http://jolokia.org/) is the server side / JVM plugin for exposing JMX as JSON over HTTP. Its awesome and is currently the only server side component of Fuse Console.
* [TypeScript](http://typescriptlang.org/) is the language used to implement the console; it compiles to JavaScript and adds classes, modules, type inference & type checking
* [AngularJS](http://angularjs.org/) is the web framework for performing real time 2 way binding of HTML to the model of the UI using simple declarative attributes in the HTML.
* [d3](http://d3js.org/) is the visualisation library used to do the force layout graphs (for example the diagram view for ActiveMQ)
* [cubism](http://square.github.com/cubism/) implements the real time horizon charts
* [dagre](https://github.com/cpettitt/dagre) for graphviz style layouts of d3 diagrams (e.g. the Camel diagram view).
* [DataTables](http://datatables.net/) for sorted/filtered tables
* [DynaTree](http://wwwendt.de/tech/dynatree/doc/dynatree-doc.html) for tree widget
* [jQuery](http://jquery.com/) small bits of general DOM stuff, usually when working with 3rd party libraries which don't use AngularJS
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) for CSS

## Code walkthrough

If you fancy contributing - and **we love contributions!** the following should give you an overview of how the code hangs together.

* Fuse Console is a single page web appplication, from [this single page of HTML](https://github.com/fusesource/fuse-console/blob/master/web-console/src/main/webapp/index.html)
* we use [AngularJS routing](http://docs.angularjs.org/api/ng.directive:ngView) to display different [partial pages](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/partials) depending on which tab/view you choose. You'll notice that the partials are simple HTML fragments which use [AngularJS](http://angularjs.org/) attributes (starting with **ng-**) along with some {{expressions}} in the markup.
* other than the JavaScript libraries listed above which live in [webapp/lib](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/lib) and are [included in the index.html](https://github.com/fusesource/fuse-console/blob/master/web-console/src/main/webapp/index.html), we then implement [AngularJS](http://angularjs.org/) controllers using [TypeScript](http://typescriptlang.org/). All the typescript source is in the [webapp/ts directory](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/ts) which is then compiled into the [webapp/js/app.js file](https://github.com/fusesource/fuse-console/blob/master/web-console/src/main/webapp/js/app.js)
* to be able to compile with TypeScript we need to use the various [TypeScript definition files](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/d.ts) to define the optionally statically typed APIs for the various APIs we use
* the controllers use the [Jolokia JavaScript API](http://jolokia.org/reference/html/clients.html#client-javascript) to interact with the server side JMX mbeans