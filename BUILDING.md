We love [contributions](http://hawt.io/contributing/index.html)! You may also want to know [how to hack on the hawtio code](http://hawt.io/developers/index.html)

Before you can begin, you'll need to install the [hawtio](http://hawt.io/) dependencies first.

## Installing Local Dependencies

To install all of the required local dependencies you first need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/). If you're on OS X we recommend just installing [npm](https://npmjs.org/) directly rather than via things like homebrew to get the latest npm crack.

Then you should be able to run:

    cd hawtio-web
    npm install

If this fails it could be you need a newer [npm](https://npmjs.org/) installation.

## Installing Global Dependencies

In order to make use of [TypeScript](http://typescriptlang.org/) you will need to install the compiler globally. Installing a dependency globally allows you to access the the dependency directly from your shell.

You can do this by running:

    npm install -g typescript@0.8.1

Note, if you are using Ubuntu then you may need to use the `sudo` command:

    sudo npm install -g typescript@0.8.1
    
[hawtio](http://hawt.io/) also makes use of [gruntjs](http://gruntjs.com/) for building. This is mentioned in more detail [here](http://hawt.io/building/index.html#Building_with_GruntJS).

You can install this by running

    npm install -g grunt@0.3.17

## Using LiveReload

The incremental build and LiveReload support allows you to edit the code and for the browser to autmatically reload once things are compiled. This makes for a much more fun and RAD development environment!!

Here's how to do it:

 1. Install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) plugin for Chrome and then enable it for the website (click the live reload icon on the right of the address bar)

 2. Run the web application (or deploy it inside your container using the hawtio-dev WAR which serves up your developer sources):

    cd hawtio-web
    mvn test-compile exec:java

 3. Incrementally build the project using a separate shell:

    cd hawtio-web
    mvn -Pwatch

 4. Enable Live Reload in your browser (open [http://localhost:8080/hawtio/] then click on the Live Reload icon to the right of the location bar).

Now if you change any source (HTML, CSS, TypeScript, JS library) the browser will auto reload on the fly. No more context-switching between your IDE and your browser! :)

To specify a different port to run on, just override the `jettyPort` property

    mvn test-compile exec:java -DjettyPort=8181

### Trying Different Containers

The above uses Jetty but you can try running hawtio in different containers via any of the following commands. Each of them runs the hawtio-web in a different container (with an empty JVM so no beans or camel by default).

    mvn tomcat7:run
    mvn tomcat6:run
    mvn jboss-as:run
    mvn jetty:run

### Incremental Compile with TypeScript

There is a handy shell script [compileTS](https://github.com/hawtio/hawtio/blob/master/hawtio/compileTS) which wraps up using the _tsc_ command to compile the [TypeScipt *.ts files](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/js) into the [webapp/js/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio/src/main/webapp/js/app.js)

    cd hawtio
    ./compileTS

By default this then generates the [webapp/js/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio/src/main/webapp/js/app.js) and it then watches for changes to the source files and auto-recompiles on the fly.

### Building with GruntJS

Another build option is [gruntjs](http://gruntjs.com/). Again to build the code with gruntjs you will need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/)

Make sure you install the local and global dependencies (see above).

Then to incrementally compile the project its a simple matter of running 'grunt' :) By default this then watches for changes to the source files and auto-recompiles on the fly

    grunt

## Running the End-to-End Integration Tests

Install [testacular](http://vojtajina.github.com/testacular/):

    npm -g install testacular

To get the latest greatest testacular crack (e.g. so console.log() statements output to the command shell, etc.) you need 0.5.x or later use this command:

    npm install -g testacular@"~0.5.7"


### Running Tests With Testacular

In a shell in the `hawtio-web` directory run:

    mvn test-compile exec:java

In another in the same directory run the following:

    testacular start src/test/config/e2e-config.js


## How to Get Started Hacking the Code

Check out the [hawtio technologies, tools and code walkthroughs](http://hawt.io/developers/index.html)

## Trying hawtio with Fuse Fabric

As of writing hawtio depends on the latest snapshot of [Fuse Fabric](http://fuse.fusesource.org/fabric/). To try out hawtio with it try these steps:

  1. Grab the latest [Fuse Fabric source code](http://fuse.fusesource.org/source.html) and do a build in the fabric directory...

    git clone git://github.com/fusesource/fuse.git
    cd fuse
    cd fabric
    mvn -Dtest=false -DfailIfNoTests=false clean install

  2. Now create a Fuse Fabric instance

    cd fuse-fabric\target
    tar xf fuse-fabric-99-master-SNAPSHOT.tar.gz
    cd fuse-fabric-99-master-SNAPSHOT
    bin/fusefabric

  3. When the Fabric starts up run the command

    fabric:create

  to properly test things out you might want to create a new version and maybe some child containers.

### Running hawtio with Fuse Fabric in development mode

    cd hawtio-web
    mvn test-compile exec:java -Psnapshot,fabric

