/// <reference path="../../baseIncludes.ts"/>
module PluginHelpers {

  export interface PluginModule {
    pluginName:string;
    log:Logging.Logger;
    _module: ng.IModule;
    controller?: (name:string, inlineAnnotatedConstructor:any[]) => any;
  }

  // creates a nice little shortcut function that plugins can use to easily
  // prefix controllers with the plugin name, helps avoid redundancy and typos
  export function createControllerFunction(_module:ng.IModule, pluginName:string) {
    return (name:string, inlineAnnotatedConstructor:any[]) => {
      return _module.controller(pluginName + '.' + name, inlineAnnotatedConstructor);
    }
  }

  // shorthand function to create a configuration for a route, saves a bit
  // of typing
  export function createRoutingFunction(templateUrl:string) {
    return (templateName:string, reloadOnSearch:boolean = true) => {
      return {
        templateUrl: templateUrl + templateName,
        reloadOnSearch: reloadOnSearch
      };
    } 
  }

}
