/**
 * @module Dashboard
 * @main Dashboard
 */
/// <reference path="dashboardHelpers.ts"/>
/// <reference path="dashboardRepository.ts"/>
/// <reference path="gridsterDirective.ts"/>
module Dashboard {
  
  export var templatePath = 'app/dashboard/html/';
  export var pluginName = 'dashboard';
  
  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/dashboard/add', {templateUrl: Dashboard.templatePath + 'addToDashboard.html'}).
            when('/dashboard/edit', {templateUrl: Dashboard.templatePath + 'editDashboards.html'}).
            when('/dashboard/idx/:dashboardIndex', {templateUrl: Dashboard.templatePath + 'dashboard.html'}).
            when('/dashboard/id/:dashboardId', {templateUrl: Dashboard.templatePath + 'dashboard.html'}).
            when('/dashboard/id/:dashboardId/share', {templateUrl: Dashboard.templatePath + 'share.html'}).
            when('/dashboard/import', {templateUrl: Dashboard.templatePath + 'import.html'});
  }]);

  _module.value('ui.config', {
    // The ui-jq directive namespace
    jq: {
      gridster: {
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
      }
    }
  });


  _module.factory('dashboardRepository', ["workspace", "jolokia", "localStorage", (workspace:Workspace, jolokia, localStorage) => {
    return new DefaultDashboardRepository(workspace, jolokia, localStorage);
  }]);


  _module.directive('hawtioDashboard', function() {
    return new Dashboard.GridsterDirective();
  });


  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", ($location:ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {
    viewRegistry['dashboard'] = 'app/dashboard/html/layoutDashboard.html';
    helpRegistry.addUserDoc('dashboard', 'app/dashboard/doc/help.md');

    workspace.topLevelTabs.push({
      id: "dashboard",
      content: "Dashboard",
      title: "View and edit your own custom dashboards",
      isValid: (workspace: Workspace) => workspace.hasMBeans(),
      href: () => "#/dashboard/idx/0?tab=dashboard",
      isActive: (workspace: Workspace) => workspace.isTopTabActive("dashboard")
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
