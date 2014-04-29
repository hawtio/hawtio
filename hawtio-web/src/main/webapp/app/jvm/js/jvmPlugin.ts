/**
 * @module JVM
 * @main JVM
 */
module JVM {

  export var rootPath = 'app/jvm';
  export var templatePath = rootPath + '/html/';
  export var pluginName = 'jvm';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'datatable', 'hawtioCore', 'hawtio-forms', 'ui']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/jvm/discover', {templateUrl: templatePath + 'discover.html'}).
                    when('/jvm/connect', {templateUrl: templatePath + 'connect.html'}).
                    when('/jvm/local', {templateUrl: templatePath + 'local.html'});
          }).
          constant('mbeanName', 'hawtio:type=JVMList').
          run(($location, workspace:Workspace, viewRegistry, layoutFull, helpRegistry, preferencesRegistry) => {

            viewRegistry[pluginName] = templatePath + 'layoutConnect.html';
            helpRegistry.addUserDoc('jvm', 'app/jvm/doc/help.md');

            preferencesRegistry.addTab("Connect", 'app/jvm/html/reset.html');

            workspace.topLevelTabs.push({
              id: "connect",
              content: "Connect",
              title: "Connect to other JVMs",
              isValid: (workspace) => true,
              href: () => {
                return '#/jvm/connect';
              },
              isActive: (workspace:Workspace) => workspace.isLinkActive("jvm")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
