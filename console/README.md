# Hawtio console assembly

This assembles all Hawtio v2 components for the Web console for Java.

## Set up development environment

### Clone the repository

    $ git clone https://github.com/hawtio/hawtio
    $ cd hawtio/hawtio-console-assembly

### Install development tools

* [Node.js](http://nodejs.org)
* [Yarn](https://yarnpkg.com)
* [gulp](http://gulpjs.com/)

### Install project dependencies

    $ yarn install

### Run the web application

    $ yarn start

#### To test Keycloak integration

    $ yarn start --keycloak

### Change the default proxy port

To proxy to a local JVM running on a different port than `8181` specify the `--port` CLI arguement to gulp:

    $ gulp --port=8282

### Turn on source maps generation for debugging TypeScript

If you want to debug `.ts` using a browser developer tool such as Chrome DevTools, pass the `--sourcemap` flag to gulp:

    $ gulp --sourcemap

Do not use this flag when you are committing the compiled `.js` file, as it embeds source maps to the output file. Use this flag only during development.
