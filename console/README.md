# Hawtio console assembly

This assembles all Hawtio.next components for the Web console for Java.

## Set up development environment

### Clone the repository

    git clone https://github.com/hawtio/hawtio
    cd hawtio/console

### Install development tools

* [Node.js](http://nodejs.org) >= 18
* [Yarn v4](https://yarnpkg.com)

### Install project dependencies

    yarn install

### Run the web application

    yarn start

#### To test Keycloak integration

TBD

### Develop console with local @hawtio/react project

Suppose you have cloned the `hawtio-next` project in the same directory as the `hawtio` project, run `yarn link` from the `console` directory as follows:

    yarn link ../../hawtio-next/packages/hawtio

This will add this fragment to `package.json`:

    "resolutions": {
        "@hawtio/react": "portal:/absolute/path/to/hawtio-next/packages/hawtio"
    }

However (see [hawtio/hawtio#3321](https://github.com/hawtio/hawtio/issues/3321])), this may cause webpack bundling problems by duplicating JavaScript modules which are now resolved both from the `console` module and from the linked package.
Changing `portal:` to `file:` [yarn protocol](https://yarnpkg.com/protocols) solves the problem at the cost of the need to run `yarn install` in the `console` after making changes in `@hawtio/react`.

Then you can build the console with the local `hawtio-next` component by running the following command from the project root directory:

    mvn install

> [!WARNING]
> Do not run `mvn clean install` as it would also wash out `node_modules/` that's linked to the local `hawtio-next` project.
