We love [contributions](http://hawt.io/contributing/index.html). This page is intented to help you get started hacking on the code, it contains various information on technology and tools together with code walkthroughs.

Welcome and enjoy! Its hawt, but stay cool! :)

## hawtio technology overview

For those interested in [contributing](http://hawt.io/contributing/index.html), here is a list of the various open source libraries used to build hawt.io.

* [jolokia](http://jolokia.org/) is the server side / JVM plugin for exposing JMX as JSON over HTTP. Its awesome and is currently the only server side component of hawt.io.
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

If you fancy contributing - and [we love contributions!](http://hawt.io/contributing/index.html) the following should give you an overview of how the code hangs together.

* hawt.io is a single page web appplication, from [this single page of HTML](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/index.html)
* we use [AngularJS routing](http://docs.angularjs.org/api/ng.directive:ngView) to display different [partial pages](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/partials) depending on which tab/view you choose. You'll notice that the partials are simple HTML fragments which use [AngularJS](http://angularjs.org/) attributes (starting with **ng-**) along with some {{expressions}} in the markup.
* other than the JavaScript libraries listed above which live in [webapp/lib](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/lib) and are [included in the index.html](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/index.html), we then implement [AngularJS](http://angularjs.org/) controllers using [TypeScript](http://typescriptlang.org/). All the typescript source is in the [webapp/app directory](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/app) which is then compiled into the [webapp/app/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/app.js)
* to be able to compile with TypeScript we need to use the various [TypeScript definition files](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/d.ts) to define the optionally statically typed APIs for the various APIs we use
* the controllers use the [Jolokia JavaScript API](http://jolokia.org/reference/html/clients.html#client-javascript) to interact with the server side JMX mbeans

## Developer Tools

The following are recommended if you want to contribute to the code

* [IntelliJ IDEA EAP 12 or later](http://confluence.jetbrains.net/display/IDEADEV/IDEA+12+EAP) as this has TypeScript support and is the daddy of IDEs!
* [AngularJS plugin for Chrome](https://chrome.google.com/webstore/detail/angularjs-batarang/ighdmehidhipcmcojjgiloacoafjmpfk) which is handy for visualising scopes and performance testing etc.
* [JSONView plugin for Chrome](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc) makes it easy to visualise JSON returned by the [REST API of Jolokia](http://jolokia.org/reference/html/protocol.html)
* [Apache Maven 3.0.3 or later](http://maven.apache.org/)
* [gruntjs](http://gruntjs.com/) a build tool for JavaScript. See nearly the beginning of this document for details of how to install and use.
* [Dash.app](http://kapeli.com/) is a handy tool for browsing API documentation for JavaScript, HTML, CSS, jquery etc.

We recommend you enable [Source Maps](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1) in your browser (e.g. in Chrome) for easier debugging by clicking on the bottom right Settings icon in *JavaScript Console* and [enabling Source Maps support such as in this video](http://www.youtube.com/watch?v=-xJl22Kvgjg)

To help IDEA navigate to functions in your source & to avoid noise; you may want to ignore some JavaScript files in IDEA so that they are not included in the navigation. Go to Settings/Preferences -> File Types -> Ignore files then add these patterns to the end; which will let IDEA ignore the minified verisons of the libraries

    *.min.js;*-min.js

Then select the generated [webapp/app/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/app.js) in the Project explorer, right click and select _Mark as Plain Text_ so that it is ignored as being JavaScript source. This hint came from [this forum thread](http://devnet.jetbrains.net/message/5472690#5472690), hopefully there will be a nicer way to do all this one day!

### Handy AngularJS debugging tip

* open the JavaScript console and select the _Console_ tab so you can type expressions into the shell.
* select part of the DOM of the scope you want to investigate
* right click and select _Inspect Element_
* now in the console type the following

    s = angular.element($0).scope()

You have now defined a variable called _s_ which contains all the values in the active AngularJS scope so you can navigate into the scope and inspect values or invoke functions in the REPL etc.


## How the tabs work

The UI updates in real time based on selections in the JMX tree; so tabs become visible or hide based on the selection.

The nav bar shows/hides based on the *validSelection()* function calls in the [index.html in the ng-show attributes](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/index.html#L39). See the [angularjs ng-show documentation for more detail](http://docs.angularjs.org/api/ng.directive:ngShow).

The validSelection("someUriPath") function calls on *$scope* calls the same [validSelection on the Workspace class](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/core/js/workspace.ts#L75) which uses this underlying [map of uri path -> validation functions](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/core/js/workspace.ts#L25)

### How to add a new tab

The following gives you an overview of how to add a new kind of tab:

* add the new URI path to [app.ts in the angularjs route definition](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/core/js/app.ts#L4)

    when("/myURI", {templateUrl: 'partials/myNewThing.html', controller: MyNewController}).

* if the tab only applies to certain selections, add an entry to the [uriValidations map of uri paths to validation functions](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/core/js/workspace.ts#L25)

    "myURI": () => this.isMyKindOfThing()

* add an entry to the [index.html nav bar](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/index.html#L39) so the new tab appears

* create your new partial HTML view (myNewThing.html in the [partials directory](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/partials)).

* create your new controller, MyNewController.ts in the [js directory](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/)
