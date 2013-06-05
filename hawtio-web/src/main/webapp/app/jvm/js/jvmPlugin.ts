module Jvm {

  var pluginName = 'jvm';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'datatable', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/jvm/connect', {templateUrl: 'app/jvm/html/connect.html'}).
                    when('/jvm/local', {templateUrl: 'app/jvm/html/local.html'});
          }).
          constant('mbeanName', 'io.hawt.jvm.local:type=JVMList').
          run(($location, workspace, viewRegistry, layoutFull) => {

            viewRegistry[pluginName] = layoutFull;

            workspace.topLevelTabs.push({
              content: "Connect",
              title: "Connect to other JVMs",
              isValid: (workspace) => true,
              href: () => '#/jvm/connect',
              isActive: (workspace:Workspace) => workspace.isLinkActive("jvm")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
