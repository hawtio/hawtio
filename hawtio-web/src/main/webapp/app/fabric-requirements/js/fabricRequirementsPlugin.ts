/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../fabric/js/fabricPlugin.ts"/>
module FabricRequirements {

  export var pluginName = "FabricRequirements";
  export var log:Logging.Logger = Logger.get(pluginName);
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);

  hawtioPluginLoader.addModule(pluginName);
}
