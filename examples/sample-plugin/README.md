# Sample Hawtio plugin TypeScript project

A sample Hawtio v3 plugin project written in TypeScript. This project doesn't run standalone, but is supposed to be used with other Spring Boot, Quarkus, or WAR projects.

Since a Hawtio plugin is based on React and [Webpack Module Federation](https://module-federation.github.io/), this project uses Yarn v3 and [CRACO](https://craco.js.org/) as the build tools. You can use any JS/TS tools for developing a Hawtio plugin so long as they can build a React and Webpack Module Federation application.

## Key components

The key components in the plugin project are as follows:

| File/Directory                                      | Description |
|-----------------------------------------------------| ----------- |
| [craco.config.js](../sample-plugin/craco.config.js) | The React application configuration file. The plugin interface is defined with `ModuleFederationPlugin`. The name `samplePlugin` and the module name `./plugin` at the `exposes` section correspond to the parameters `scope` and `module` set to `HawtioPlugin` in `PluginContextListener.java`. |
| [src/sample-plugin](./src/sample-plugin)            | This is where the actual code of the plugin is located. | 
| [pom.xml](./pom.xml)                                | This project uses Maven as the primary tool for building. Here, the `frontend-maven-plugin` is used to trigger the build of `sample-plugin` TypeScript project. |

## How to build

```console
mvn install
```
