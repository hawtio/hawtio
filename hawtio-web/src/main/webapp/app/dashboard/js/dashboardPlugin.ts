module Dashboard {
  var pluginName = 'dashboard';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {

            $routeProvider.
                    when('/dashboards/edit', {templateUrl: 'app/dashboard/html/editDashboards.html'}).
                    when('/dashboard/:dashboardId', {templateUrl: 'app/dashboard/html/dashboard.html'});

          }).
          value('ui.config', {
            // The ui-jq directive namespace
            jq: {
              gridster: {
                widget_margins: [10, 10],
                widget_base_dimensions: [140, 140]
              }
            }
          }).
          factory('dashboardRepository', function () {
            return new DashboardRepository();
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry) => {

            viewRegistry['dashboard'] = 'app/dashboard/html/layoutDashboard.html';

            workspace.topLevelTabs.push({
              content: "Dashboard",
              title: "View and edit your own custom dashboards",
              isValid: () => true,
              href: () => "#/dashboards/edit?tab=dashboard",
              isActive: () => workspace.isTopTabActive("dashboard")
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
