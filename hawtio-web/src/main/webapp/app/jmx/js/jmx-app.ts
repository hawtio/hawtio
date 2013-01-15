module Jmx {
  var pluginName = 'jmx';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/jmx/attributes', {templateUrl: 'app/core/html/attributes.html', controller: AttributesController}).
            when('/jmx/operations', {templateUrl: 'app/core/html/operations.html', controller: OperationsController}).
            when('/jmx/charts', {templateUrl: 'app/core/html/charts.html', controller: ChartController}).
            when('/jmx/chartEdit', {templateUrl: 'app/core/html/chartEdit.html', controller: ChartEditController})
  }).
          run(($location: ng.ILocationService, workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['logs'] = () => workspace.isOsgiFolder();


            workspace.topLevelTabs.push( {
              content: "JMX",
              title: "View the JMX MBeans in this process",
              isValid: () => true,
              href: () => url("#/jmx/attributes"),
              isActive: () => workspace.isLinkActive("jmx")
            });


            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Attributes',
              title: "View the attribute values on your selection",
              isValid: () => true,
              href: () => "#/jmx/attributes"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-bar-chart"></i> Chart',
              title: "View a chart of the metrics on your selection",
              isValid: () => true,
              href: () => "#/jmx/charts"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-cog"></i> Edit Chart',
              title: "Edit the chart configuration",
              isValid: () => workspace.isLinkActive("jmx/chart"),
              href: () => "#/jmx/chartEdit"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-leaf"></i> Operations',
              title: "Execute operations on your selection",
              isValid: () => true,
              href: () => "#/jmx/operations"
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
