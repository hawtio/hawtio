module Jmx {
  var pluginName = 'jmx';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/jmx', {templateUrl: 'app/core/html/help.html', controller: Core.NavBarController})
  }).
          run(($location: ng.ILocationService, workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['logs'] = () => workspace.isOsgiFolder();


            workspace.topLevelTabs.push( {
              content: "JMX",
              title: "View the JMX MBeans in this process",
              isValid: () => true,
              href: () => url("#/attributes")
            });


            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Attributes',
              title: "View the attribute values on your selection",
              isValid: () => true,
              href: () => "#/attributes"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-bar-chart"></i> Chart',
              title: "View a chart of the metrics on your selection",
              isValid: () => true,
              href: () => "#/charts"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-cog"></i> Edit Chart',
              title: "Edit the chart configuration",
              isValid: () => true,
              href: () => "#/chartEdit"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-leaf"></i> Operations',
              title: "Execute operations on your selection",
              isValid: () => true,
              href: () => "#/operations"
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
