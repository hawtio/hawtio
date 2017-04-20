## hawtio console assembly

This assembles all hawtio v2 components for the web console for Java.

### Basic usage

#### Running this project locally

First clone the source

    git clone -b 2.x https://github.com/hawtio/hawtio
    cd hawtio/hawtio-console-assembly

Next you'll need to [install NodeJS](http://nodejs.org/download/) and then install the default global npm dependencies:

    npm install -g bower gulp slush slush-hawtio-javascript slush-hawtio-typescript typescript

Then install all local nodejs packages and update bower dependencies via:

    npm install
    bower update

Then to run the web application:

    gulp

#### Install the bower package

    bower install --save hawtio-console-assembly

#### Change the default proxy port

To proxy to a local JVM running on a different port than `8181` specify the `--port` CLI arguement to gulp:

    gulp --port=8282

#### Turn on source maps generation for debugging TypeScript

If you want to debug `.ts` using a browser developer tool such as Chrome DevTools, pass the `--sourcemap` flag to gulp:

    gulp --sourcemap

Do not use this flag when you are committing the compiled `.js` file, as it embeds source maps to the output file. Use this flag only during development.
