## Working on the source the code

We love [contributions](CONTRIBUTING.md)! You may also want to know [how to develop it](DEVELOPERS.md)

You'll need to install [TypeScript](http://typescriptlang.org/) first...

### Installing typescript

To install [TypeScript](http://typescriptlang.org/) you first need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/)

Then you should be able to run:

    npm install -g typescript

### Building with TypeScript

There is a handy shell script [compileTS](https://github.com/hawtio/hawtio/blob/master/hawtio/compileTS) which wraps up using the _tsc_ command to compile the [TypeScipt *.ts files](https://github.com/hawtio/hawtio/tree/master/hawtio/src/main/webapp/js) into the [webapp/js/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio/src/main/webapp/js/app.js)

    cd hawtio
    ./compileTS

By default this then generates the [webapp/js/app.js file](https://github.com/hawtio/hawtio/blob/master/hawtio/src/main/webapp/js/app.js) and it then watches for changes to the source files and auto-recompiles on the fly.

## Building with GruntJS

Another build option is [gruntjs](http://gruntjs.com/). Again to build the code with gruntjs you will need to install [npm](https://npmjs.org/) e.g. by [installing nodejs](http://nodejs.org/)

Then to install grunt:

    npm install -g grunt

Then in the hawtio directory you will need to install the grunt plugins required

    cd hawtio
    npm install grunt-type

### Incremental compile with GruntJS

Its a simple matter of running 'grunt' :) By default this then watches for changes to the source files and auto-recompiles on the fly

    grunt

