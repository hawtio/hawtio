module Health {
  var pluginName = 'health';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/health', {templateUrl: 'app/core/html/health.html', controller: HealthController})
  }).
          run(($location: ng.ILocationService, workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['logs'] = () => workspace.isOsgiFolder();


            workspace.topLevelTabs.push( {
              content: "Health",
              title: "View the health of the various sub systems",

              // TODO move this mbean helper to this plugin?
              isValid: () => Health.hasHealthMBeans(workspace),
              href: () => url("#/health"),
              viewPartial: Core.layoutFull,
              ngClick: () => {
                $location.path(url("#/health"));
              }
            });
          });

  hawtioPluginLoader.addModule(pluginName);

}
