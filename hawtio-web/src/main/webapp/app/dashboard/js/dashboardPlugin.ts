module Dashboard {
  var pluginName = 'dashboard';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {

    $routeProvider.
      when('/dashboard/:dashboardId', {templateUrl: 'app/dashboard/html/dashboard.html', controller: DashboardController});
  }).
          run(($location: ng.ILocationService, workspace:Workspace, viewRegistry) => {

            viewRegistry['dashboard'] = 'app/dashboard/html/layoutDashboard.html';

            workspace.topLevelTabs.push( {
              content: "Dashboard",
              title: "View and edit your own custom dashboards",
              isValid: () => true,
              href: () => "#/dashboard/foo?tab=dashboard",
              isActive: () => workspace.isTopTabActive("dashboard")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
