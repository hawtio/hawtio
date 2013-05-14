module Jmx {
  var pluginName = 'jmx';

  angular.module(pluginName, ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.modal', 'ngResource', 'ngGrid', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/jmx/attributes', {templateUrl: 'app/jmx/html/attributes.html'}).
            when('/jmx/operations', {templateUrl: 'app/jmx/html/operations.html'}).
            when('/jmx/charts', {templateUrl: 'app/jmx/html/charts.html'}).
            when('/jmx/chartEdit', {templateUrl: 'app/jmx/html/chartEdit.html'}).
            when('/jmx/help/:tabName', {templateUrl: 'app/core/html/help.html'})
  }).
          factory('jmxTreeLazyLoadRegistry',function () {
            return Jmx.lazyLoaders;
          }).

          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry, layoutTree, jolokia, pageTitle) => {

            viewRegistry['jmx'] = layoutTree;


            try {
              var id = jolokia.getAttribute('java.lang:type=Runtime', 'Name');
              if (id) {
                pageTitle.push(id);
              }
            } catch (e) {
              // ignore
            }

            workspace.topLevelTabs.push( {
              content: "JMX",
              title: "View the JMX MBeans in this process",
              isValid: (workspace: Workspace) => true,
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
