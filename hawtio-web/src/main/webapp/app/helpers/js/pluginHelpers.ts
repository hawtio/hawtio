/// <reference path="../../baseIncludes.ts"/>
module PluginHelpers {

  export interface PluginModule {
    pluginName:string;
    log:Logging.Logger;
    _module: ng.IModule;
    controller?: (name:string, inlineAnnotatedConstructor:any[]) => any;
  }
 
  export function createControllerFunction(_module:ng.IModule, pluginName:string) {
    return (name:string, inlineAnnotatedConstructor:any[]) => {
      return _module.controller(pluginName + '.' + name, inlineAnnotatedConstructor);
    }
  }

}
