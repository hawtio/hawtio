/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../helpers/js/stringHelpers.ts"/>
module Core {

  /**
   * Typescript interface that represents the UserDetails service
   */
  export interface UserDetails {
    username: String
    password: String
    loginDetails?: Object
  }

  /**
   * Info related to keycloak integration
   */
  export interface KeycloakContext {
    enabled: boolean;
    keycloak: KeycloakModule.IKeycloak;
  }

  /**
   * Typescript interface that represents the options needed to connect to another JVM
   */
  export interface ConnectToServerOptions {
    scheme: String;
    host?: String;
    port?: Number;
    path?: String;
    useProxy: boolean;
    jolokiaUrl?: String;
    userName: String;
    password: String;
    view: String;
    name: String;
  }

  /**
   * Shorter name, less typing :-)
   */
  export interface ConnectOptions extends ConnectToServerOptions {

  }

  export interface ConnectionMap {
    [name:string]: ConnectOptions;
  }

  /**
   * Factory to create an instance of ConnectToServerOptions
   * @returns {ConnectToServerOptions}
   */
  export function createConnectToServerOptions(options?:any):ConnectToServerOptions {
    var defaults = <ConnectToServerOptions> {
      scheme: 'http',
      host: null,
      port: null,
      path: null,
      useProxy: true,
      jolokiaUrl: null,
      userName: null,
      password: null,
      view: null,
      name: null
    };
    var opts = options || {};
    return angular.extend(defaults, opts);
  }

  export function createConnectOptions(options?:any) {
    return <ConnectOptions> createConnectToServerOptions(options);
  }


}
