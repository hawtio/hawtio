/**
 * API plugin for browsing WSDL and WADL
 *
 * @module API
 * @main API
 */
/// <reference path="apiHelpers.ts"/>
module API {
  export var pluginName = 'api';
  export var _module = angular.module(pluginName, ['bootstrap', 'hawtioCore', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/api/wsdl', {templateUrl: 'app/api/html/wsdl.html'}).
            when('/api/wadl', {templateUrl: 'app/api/html/wadl.html'});
  }]);


  _module.run(["$location", "workspace", "viewRegistry", "layoutFull", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

    viewRegistry['api'] = layoutFull;
    /*
    helpRegistry.addUserDoc('log', 'app/wsdl/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'});
    });
    */
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
