/**
 * @module Jvm
 * @main Jvm
 */
module Jvm {

  var pluginName = 'jvm';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'datatable', 'hawtioCore', 'hawtio-forms']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/jvm/connect', {templateUrl: 'app/jvm/html/connect.html'}).
                    when('/jvm/local', {templateUrl: 'app/jvm/html/local.html'});
          }).
          constant('mbeanName', 'hawtio:type=JVMList').
          run(($location, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry[pluginName] = layoutFull;
            helpRegistry.addUserDoc('jvm', 'app/jvm/doc/help.md');

            workspace.topLevelTabs.push({
              id: "connect",
              content: "Connect",
              title: "Connect to other JVMs",
              isValid: (workspace) => true,
              href: () => '#/jvm/connect',
              isActive: (workspace:Workspace) => workspace.isLinkActive("jvm")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
