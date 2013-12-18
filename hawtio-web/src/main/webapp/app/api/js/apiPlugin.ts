/**
 * API plugin for browsing WSDL and WADL
 *
 * @module API
 * @main API
 */
module API {
  var pluginName = 'api';
  angular.module(pluginName, ['bootstrap', 'hawtioCore', 'hawtio-ui']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/api/wsdl', {templateUrl: 'app/api/html/wsdl.html'}).
                    when('/api/wadl', {templateUrl: 'app/api/html/wadl.html'});
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry['api'] = layoutFull;
/*
            helpRegistry.addUserDoc('log', 'app/wsdl/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'});
            });
*/
          });

  hawtioPluginLoader.addModule(pluginName);
}
