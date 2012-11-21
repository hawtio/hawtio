# Fuse Web Console

The Fuse Web Console provides a web based console for working with Fuse

## Trying out the console from Maven

From a git clone you should be able to run the sample web console as follows:

    cd fuseide
    cd web/web-console
    mvn test-compile exec:java
    open http://localhost:8080/

That should run a little sample web application with some ActiveMQ and Camel to interact with

A good MBean for real time values and charts is java.lang/OperatingSystem or tyr looking at queues or camle routes etc

## Building with GruntJS

When developing the console, the most RAD tool for building the client side is [gruntjs](http://gruntjs.com/)

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


