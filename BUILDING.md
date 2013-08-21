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

    npm install -g typescript

Note, if you are using Ubuntu then you may need to use the `sudo` command:

    sudo npm install -g typescript
    
[hawtio](http://hawt.io/) also makes use of [gruntjs](http://gruntjs.com/) for building. This is mentioned in more detail [here](http://hawt.io/building/index.html#Building_with_GruntJS).

You can install this by running

    npm install -g grunt-cli

## Using LiveReload

The incremental build and LiveReload support allows you to edit the code and for the browser to autmatically reload once things are compiled. This makes for a much more fun and RAD development environment!!

Here's how to do it:

Install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) plugin for Chrome and then enable it for the website (click the live reload icon on the right of the address bar)

Run the web application (or deploy it inside your container using the hawtio-dev WAR which serves up your developer sources):

    cd hawtio-web
    mvn compile
    mvn test-compile exec:java

On OS X and linux the _mvn compile_ command above is unnecessary but folks have found on windows there can be timing issues with grunt and maven that make this extra step a requirement (see [issue #203 for more details](https://github.com/hawtio/hawtio/issues/203#issuecomment-15808516))

Now incrementally build the project and run the live reload server using a **separate shell** (while keeping the above shell running!):


    cd hawtio-web
    mvn -Pwatch


Enable Live Reload in your browser (open [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/) then click on the Live Reload icon to the right of the location bar).

Now if you change any source (HTML, CSS, TypeScript, JS library) the browser will auto reload on the fly. No more context-switching between your IDE and your browser! :)

To specify a different port to run on, just override the `jettyPort` property

    mvn test-compile exec:java -DjettyPort=8181

### Trying Different Containers

The above uses Jetty but you can try running hawtio in different containers via any of the following commands. Each of them runs the hawtio-web in a different container (with an empty JVM so no beans or camel by default).

    mvn tomcat7:run
    mvn tomcat6:run
    mvn jboss-as:run
    mvn jetty:run

### Using your build & LiveReload inside web containers containers

The easiest way to use other containers and still get the benefits of LiveReload is to create a symbolic link to the generated hawtio-web war in expanded form, in the deploy directory in your web server.

e.g. to use Tomcat7 in LiveReload mode try the following to create a symbolic link in the tomcat/webapps directory to the **hawtio-web/target/hawtio-web-1.1-SNAPSHOT** directory:

    cd tomcat/webapps
    ln -s ~/hawtio/hawtio-web/target/hawtio-web-1.1-SNAPSHOT hawtio

Then in a shell run

    cd hawtio-web
    mvn -Pwatch

Now just run Tomcat as normal. You should have full LiveReload support and should not have to stop/start Tomcat or recreate the WAR etc!

#### Using your build from inside Jetty

For jetty you need to name the symlink directory **hawtio.war** for [Jetty to recognise it](http://www.eclipse.org/jetty/documentation/current/automatic-webapp-deployment.html).

    cd jetty-distribution/webapps
    ln -s ~/hawtio/hawtio-web/target/hawtio-web-1.1-SNAPSHOT hawtio.war

Another thing is for symlinks jetty uses the real directory name rather than the symlink name for the context path.

So to open the application in Jetty open [http://localhost:8080/hawtio-web-1.1-SNAPSHOT/](http://localhost:8080/hawtio-web-1.1-SNAPSHOT/)


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

## Running Unit Tests

You can run the unit tests via maven:

    cd hawtio-web
    mvn test


If you have a local build (or ideally are using the _mvn -Pwatch_ command to do incremental compiles as you edit the source), you can open the unit test runner via the following:

    cd hawtio-web
    open src/test/specs/SpecRunner.html

This then runs the [unit test specifications](https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/test/specs/spec) using [Jasmine](http://pivotal.github.com/jasmine/) in your browser. From this web page you can use the browser's debugger and console to debug and introspect unit test cases as required.

If you are using the [LiveReload plugin for Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) you can then hit the LiveReload icon to the right of the address bar and if you are running the watch profile, the tests are re-run every time there is a compile:

    mvn -Pwatch

Now the unit tests are all re-run whenever you edit the source.


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

