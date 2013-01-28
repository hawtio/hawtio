module Health {
  var pluginName = 'health';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/health', {templateUrl: 'app/health/html/health.html', controller: HealthController})
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull) => {

            viewRegistry['health'] = layoutFull;

            workspace.topLevelTabs.push( {
              content: "Health",
              title: "View the health of the various sub systems",

              // TODO move this mbean helper to this plugin?
              isValid: () => Health.hasHealthMBeans(workspace),
              href: () => "#/health"
            });

/*
            workspace.subLevelTabs.push( {
              content: '<i class="icon-eye-open"></i> Health',
              title: "View the health of either all of a selected subset of the systems",
              isValid: () => Health.hasHealthMBeans(workspace),
              href: () => "#/health"
            });
*/

          });

  hawtioPluginLoader.addModule(pluginName);

}
