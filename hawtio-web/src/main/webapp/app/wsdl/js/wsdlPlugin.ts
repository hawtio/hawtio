module Wsdl {
  var pluginName = 'wsdl';
  angular.module(pluginName, ['bootstrap', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/wsdl/view', {templateUrl: 'app/wsdl/html/view.html'})
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry['wsdl'] = layoutFull;
/*
            helpRegistry.addUserDoc('log', 'app/wsdl/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'});
            });
*/
          });

  hawtioPluginLoader.addModule(pluginName);
}
