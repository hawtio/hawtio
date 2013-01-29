module Jmx {
  var pluginName = 'jmx';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/jmx/attributes', {templateUrl: 'app/jmx/html/attributes.html'}).
            when('/jmx/operations', {templateUrl: 'app/jmx/html/operations.html', controller: OperationsController}).
            when('/jmx/charts', {templateUrl: 'app/jmx/html/charts.html', controller: ChartController}).
            when('/jmx/cheese', {templateUrl: 'app/jmx/html/cheese.html'}).
            when('/jmx/chartEdit', {templateUrl: 'app/jmx/html/chartEdit.html', controller: ChartEditController}).
            when('/jmx/help/:tabName', {templateUrl: 'app/core/html/help.html', controller: Core.NavBarController})
  }).
          provider('location', function() {

              this.$get = function(workspace, $location) {
                console.log("=========== location decorator called with workspace " + workspace + " and $location " + $location);
                if (workspace) {
                  var custom = workspace["$location"];
                  if (custom) return custom;
                }
                return $location;
              };
          }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutTree) => {

            viewRegistry['jmx'] = layoutTree;

            workspace.topLevelTabs.push( {
              content: "JMX",
              title: "View the JMX MBeans in this process",
              isValid: () => true,
              href: () => "#/jmx/attributes",
              isActive: () => workspace.isTopTabActive("jmx")
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
