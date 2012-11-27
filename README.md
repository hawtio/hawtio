# Fuse Console

A web based console for working with [Fuse](http://fuse.fusesource.org/).

## Trying out the console from Maven

From a git clone you should be able to run the sample web console as follows:

    cd web-console
    mvn test-compile exec:java
    open http://localhost:8080/

That should run a little sample web application with some ActiveMQ and Camel inside to interact with.

A good MBean for real time values and charts is java.lang/OperatingSystem or try looking at queues or camel routes. Notice that as you change selections in the tree the list of tabs aavailable changes dynamically based onthe content.

## Building with GruntJS

When developing the console, the most RAD tool for building the client side is [gruntjs](http://gruntjs.com/). We use it to automatically compile the [*.ts TypeScript files](http://typescriptlang.org/) [source code](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/js) for the web console into JavaScript for RAD development.

### Installing GruntJS

To build the code with gruntjs you will need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/)

Then to install grunt:

    npm install -g grunt

Then in the web-console directory you will need to install the grunt plugins required

    cd web/web-console
    npm install grunt-type

### Incremental compile with GruntJS

Its a simple matter of running 'grunt' :) By default this then watches for changes to the source files and auto-recompiles on the fly

    grunt

## Technology overview

For those interested in contributing, here is a low down of the various open source libraries used to build Fuse Console.

* [jolokia](http://jolokia.org/) is the server side / JVM plugin for exposing JMX as JSON over HTTP. Its awesome and is currently the only server side component of Fuse Console.
* [TypeScript](http://typescriptlang.org/) is the language used to implement the console; it compiles to JavaScript and adds classes, modules, type inference & type checking. We recommend [IntelliJ IDEA EAP 12 or later](http://confluence.jetbrains.net/display/IDEADEV/IDEA+12+EAP) for editing TypeScript - especially if you don't use Windows or Visual Studio (though there is a Sublime Text plugin too).
* [AngularJS](http://angularjs.org/) is the web framework for performing real time 2 way binding of HTML to the model of the UI using simple declarative attributes in the HTML.
* [d3](http://d3js.org/) is the visualisation library used to do the force layout graphs (for example the diagram view for ActiveMQ)
* [cubism](http://square.github.com/cubism/) implements the real time horizon charts
* [dagre](https://github.com/cpettitt/dagre) for graphviz style layouts of d3 diagrams (e.g. the Camel diagram view).
* [DataTables](http://datatables.net/) for sorted/filtered tables
* [DynaTree](http://wwwendt.de/tech/dynatree/doc/dynatree-doc.html) for tree widget
* [jQuery](http://jquery.com/) small bits of general DOM stuff, usually when working with 3rd party libraries which don't use AngularJS
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) for CSS

### Developer References

If you are interested in working on the code the following references and articles have been really useful so far:

* [angularjs API](http://docs.angularjs.org/api/)
* [bootstrap API](http://twitter.github.com/bootstrap/base-css.html)
* [cubism API](https://github.com/square/cubism/wiki/API-Reference)
* [d3 API](https://github.com/mbostock/d3/wiki/API-Reference)
* [datatables API](http://www.datatables.net/api)
* [javascript API](http://www.w3schools.com/jsref/default.asp)
* [sugarjs API](http://sugarjs.com/api/Array/sortBy)

### Developer Articles and Forums

* [AngularJS tips and tricks](http://deansofer.com/posts/view/14/AngularJs-Tips-and-Tricks-UPDATED)
* [AngularJS questions on stackoverflow](http://stackoverflow.com/questions/tagged/angularjs)

## Code walkthrough

If you fancy contributing - and **we love contributions!** the following should give you an overview of how the code hangs together.

* Fuse Console is a single page web appplication, from [this single page of HTML](https://github.com/fusesource/fuse-console/blob/master/web-console/src/main/webapp/index.html)
* we use [AngularJS routing](http://docs.angularjs.org/api/ng.directive:ngView) to display different [partial pages](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/partials) depending on which tab/view you choose. You'll notice that the partials are simple HTML fragments which use [AngularJS](http://angularjs.org/) attributes (starting with **ng-**) along with some {{expressions}} in the markup.
* other than the JavaScript libraries listed above which live in [webapp/lib](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/lib) and are [included in the index.html](https://github.com/fusesource/fuse-console/blob/master/web-console/src/main/webapp/index.html), we then implement [AngularJS](http://angularjs.org/) controllers using [TypeScript](http://typescriptlang.org/). All the typescript source is in the [webapp/js directory](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/webapp/js) which is then compiled into the [webapp/js/app.js file](https://github.com/fusesource/fuse-console/blob/master/web-console/src/main/webapp/js/app.js)
* to be able to compile with TypeScript we need to use the various [TypeScript definition files](https://github.com/fusesource/fuse-console/tree/master/web-console/src/main/d.ts) to define the optionally statically typed APIs for the various APIs we use
* the controllers use the [Jolokia JavaScript API](http://jolokia.org/reference/html/clients.html#client-javascript) to interact with the server side JMX mbeans

## Developer Tools

The following are recommended if you want to contribute to the code

* [IntelliJ IDEA EAP 12 or later](http://confluence.jetbrains.net/display/IDEADEV/IDEA+12+EAP) as this has TypeScript support and is the daddy of IDEs!
* [Apache Maven 3.0.3 or later](http://maven.apache.org/)
* [gruntjs](http://gruntjs.com/) - see nearly the beginning of this document for details of how to install and use.

We recommend you enable [Source Maps](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1) in your browser (e.g. in Chrome) for easier debugging by clicking on the bottom right Settings icon in *JavaScript Console* and [enabling Source Maps support such as in this video](http://www.youtube.com/watch?v=-xJl22Kvgjg)

To help IDEA navigate to functions in your source & to avoid noise; you may want to ignore some files in IDEA. Go to Settings/Preferences -> File Types -> Ignore files then add these patterns to the end; which will let IDEA ignore the generated JS file, the source map files and the minified JS files when navigating around code.

    app.js;*.js.map;*.min.js;