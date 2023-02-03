# Hawtio console assembly

This assembles all Hawtio.next components for the Web console for Java.

## Set up development environment

### Clone the repository

    git clone https://github.com/hawtio/hawtio
    cd hawtio/console

### Install development tools

* [Node.js](http://nodejs.org) >= 16
* [Yarn v3](https://yarnpkg.com)

### Install project dependencies

    yarn install

### Run the web application

    yarn start

#### To test Keycloak integration

TBD

### Develop console with local @hawtio/react project

Suppose you have cloned the `hawtio-next` project in the same directory as the `hawtio` project, run `yarn link` from the `console` directory as follows:

    yarn link ../../hawtio-next/packages/hawtio

Then you can build the console with the local `hawtio-next` component by running the following command from the project root directory:

    mvn clean install
