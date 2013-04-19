module Jvm {

  var pluginName = 'jvm';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'datatable', 'hawtioCore']).
    config(($routeProvider) => {
        $routeProvider.
            when('/jvms', {templateUrl: 'app/jvm/html/jvms.html'});
      }).
    constant('mbeanName', 'io.hawt.jvm.local:type=JVMList').
    run(($location, workspace, viewRegistry, layoutFull) => {

        viewRegistry[pluginName] = layoutFull;

        workspace.topLevelTabs.push({
          content: "JVMs",
          title: "View local JVMs and connect hawtio to them",
          isValid: (workspace) => workspace.treeContainsDomainAndProperties('io.hawt.jvm.local', {type: 'JVMList'}),
          href: () => '#/jvms',
          isActive: (workspace: Workspace) => workspace.isLinkActive("jvms")

        });

      });



  hawtioPluginLoader.addModule(pluginName);

}
