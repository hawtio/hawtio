We love [contributions](http://hawt.io/contributing/index.html)! You may also want to know [how to hack on the hawt.io code](http://hawt.io/developers/index.html)

You'll need to install the [hawt.io](http://hawt.io/) dependencies first...

### Installing local dependencies

To install all of the required local dependencies you first need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/). If you're on OS X we recommend just installing [npm](https://npmjs.org/) directly rather than via things like homebrew to get the latest npm crack.

Then you should be able to run:

    cd hawtio-web
    npm install

### Installing global dependencies

In order to make use of [TypeScript](http://typescriptlang.org/) you will need to install the compiler globally. Installing a dependency globally allows you to access the the dependency directly from your shell

You can do this by running:

    npm install -g typescript

Note, if you are using Ubuntu then you may need to use the sudo command:

    sudo npm install -g typescript

## Using LiveReload

The incremental build and LiveReload support allows you to edit the code and for the browser to automatically reload once things are compiled. This makes for a much more fun and RAD development environment!!

Here's how to do it:

install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) plugin for Chrome and then enable it for the website (click the live reload icon on the right of the address bar)

run the web application (or deploy it inside your container using the hawtio-dev WAR which serves up your developer sources)

    cd hawtio-web
    mvn test-compile exec:java

then incrementally build the project using a separate shell:

    cd hawtio-web
    mvn -Pwatch

Enable Live Reload in your browser (so open http://localhost:8080/hawtio/ then click on the Live Reload icon to the right of the location bar).

Now if you change any source (HTML, CSS, TypeScript, JS library) the browser will auto reload on the fly. No more context switching between your IDE and your browser! :)

To specify a different port to run on, just override the **jettyPort** property

    mvn test-compile exec:java -DjettyPort=8181


### Incremental compile with TypeScript

There is a handy shell script [compileTS](https://github.com/hawtio/hawtio/blob/master/hawtio/compileTS) which wraps up using the _tsc_ command to compile the [TypeScipt *.ts files](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/js) into the [webapp/js/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio/src/main/webapp/js/app.js)

    cd hawtio
    ./compileTS

By default this then generates the [webapp/js/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio/src/main/webapp/js/app.js) and it then watches for changes to the source files and auto-recompiles on the fly.

### Building with GruntJS

Another build option is [gruntjs](http://gruntjs.com/). Again to build the code with gruntjs you will need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/)

Then to install grunt:

    npm install -g grunt

Then in the hawtio directory you will need to install the grunt plugins required

    cd hawtio-web
    npm install grunt-type

Then to incrementally compile the project its a simple matter of running 'grunt' :) By default this then watches for changes to the source files and auto-recompiles on the fly

    grunt

## Running the end to end integration tests

Install [testacular](http://vojtajina.github.com/testacular/):

    npm -g install testacular

To get the latest greatest testacular crack (e.g. so console.log() statements output to the command shell etc) you need 0.5.x or later. I installed it via these commands:

    curl http://registry.npmjs.org/testacular/-/testacular-0.5.7.tgz | tar -xv && mv package testacular

    # create symlinks (optional)
    cd testacular
    sudo ln -s $PWD/bin/testacular /usr/local/bin/testacular

    # install dependencies
    sudo npm install .


### Running tests with testacular

In a shell in hawtio-web directory run:

    mvn test-compile exec:java

In another in the same directory run the following:

    testacular start src/test/config/e2e-config.js


## How to get started hacking the code

Check out the [hawt.io technologies, tools and code walkthroughs](http://hawt.io/developers/index.html)
