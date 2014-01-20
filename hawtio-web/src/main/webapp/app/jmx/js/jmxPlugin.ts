/**
 * @module Jmx
 * @main Jmx
 */
module Jmx {
  var pluginName = 'jmx';

  export var currentProcessId = '';

  angular.module(pluginName, ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.modal', 'ngResource', 'ngGrid', 'hawtioCore', 'hawtio-ui']).config(($routeProvider) => {
    $routeProvider.
            when('/jmx/attributes', {templateUrl: 'app/jmx/html/attributes.html'}).
            when('/jmx/operations', {templateUrl: 'app/jmx/html/operations.html'}).
            when('/jmx/charts', {templateUrl: 'app/jmx/html/charts.html'}).
            when('/jmx/chartEdit', {templateUrl: 'app/jmx/html/chartEdit.html'}).
            when('/jmx/help/:tabName', {templateUrl: 'app/core/html/help.html'}).
            when('/jmx/widget/donut', {templateUrl: 'app/jmx/html/donutChart.html'}).
            when('/jmx/widget/area', {templateUrl: 'app/jmx/html/areaChart.html'});
          }).
          factory('jmxTreeLazyLoadRegistry',function () {
            return Jmx.lazyLoaders;
          }).
          factory('jmxWidgetTypes', () => {
            return Jmx.jmxWidgetTypes;
          }).
          factory('jmxWidgets', () => {
            return Jmx.jmxWidgets;
          }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutTree, jolokia, pageTitle:Core.PageTitle, helpRegistry) => {

            viewRegistry['jmx'] = layoutTree;
            helpRegistry.addUserDoc('jmx', 'app/jmx/doc/help.md');

            pageTitle.addTitleElement(():string => {
              if (Jmx.currentProcessId === '') {
                try {
                  Jmx.currentProcessId = jolokia.getAttribute('java.lang:type=Runtime', 'Name');
                } catch (e) {
                  // ignore
                }
                if (Jmx.currentProcessId && Jmx.currentProcessId.has("@")) {
                  Jmx.currentProcessId = "pid:" +  Jmx.currentProcessId.split("@")[0];
                }
              }
              return Jmx.currentProcessId;
            });


            workspace.topLevelTabs.push( {
              id: "jmx",
              content: "JMX",
              title: "View the JMX MBeans in this process",
              isValid: (workspace: Workspace) => workspace.hasMBeans(),
              href: () => "#/jmx/attributes",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("jmx")
            });


            workspace.subLevelTabs.push( {
              content: '<i class="icon-list"></i> Attributes',
              title: "View the attribute values on your selection",
              isValid: (workspace: Workspace) => true,
              href: () => "#/jmx/attributes"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-leaf"></i> Operations',
              title: "Execute operations on your selection",
              isValid: (workspace: Workspace) => true,
              href: () => "#/jmx/operations"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-bar-chart"></i> Chart',
              title: "View a chart of the metrics on your selection",
              isValid: (workspace: Workspace) => true,
              href: () => "#/jmx/charts"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-cog"></i> Edit Chart',
              title: "Edit the chart configuration",
              isValid: (workspace: Workspace) => workspace.isLinkActive("jmx/chart"),
              href: () => "#/jmx/chartEdit"
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
