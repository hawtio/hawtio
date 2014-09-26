/**
 * @module Infinispan
 * @main Infinispan
 */
/// <reference path="infinispanHelpers.ts"/>
module Infinispan {
  var pluginName = 'infinispan';
  export var jmxDomain = 'org.infinispan';

  var toolBar = "app/infinispan/html/attributeToolBar.html";

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/infinispan/query', {templateUrl: 'app/infinispan/html/query.html'});
  }]);

  _module.filter('infinispanCacheName', () => infinispanCacheName);

  _module.run(["workspace", "viewRegistry", "helpRegistry", (workspace:Workspace, viewRegistry, helpRegistry) => {

    viewRegistry['infinispan'] = 'app/infinispan/html/layoutCacheTree.html';
    helpRegistry.addUserDoc('infinispan', 'app/infinispan/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties(jmxDomain);
    });

    /*
      Jmx.addAttributeToolBar(pluginName, jmxDomain, (selection: NodeSelection) => {
      // TODO there should be a nicer way to do this!
      var folderNames = selection.folderNames;
      if (folderNames && selection.domain === jmxDomain) {
      return toolBar;
      }
      return null;
      });
      */


    // register default attribute views
    var nameTemplate = '<div class="ngCellText" title="Infinispan cache">{{row.entity | infinispanCacheName}}</div>';

    var attributes = workspace.attributeColumnDefs;
    attributes[jmxDomain + "/Caches/folder"] = [
      {field: '_id', displayName: 'Name',
        cellTemplate: nameTemplate, width: "**" },
      {field: 'numberOfEntries', displayName: 'Entries'},
      {field: 'hits', displayName: 'Hits'},
      {field: 'hitRatio', displayName: 'Hit Ratio'},
      {field: 'stores', displayName: 'Stores'},
      {field: 'averageReadTime', displayName: 'Avg Read Time'},
      {field: 'averageWriteTime', displayName: 'Avg Write Time'}
    ];

    workspace.topLevelTabs.push({
      id: "infinispan",
      content: "Infinispan",
      title: "View your distributed data",
      isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
      href: () => "#/jmx/attributes?tab=infinispan",
      isActive: (workspace:Workspace) => workspace.isTopTabActive("infinispan")
    });

    workspace.subLevelTabs.push({
      content: '<i class="icon-pencil"></i> Query',
      title: "Perform InSQL commands on the cache",
      isValid: (workspace: Workspace) => Infinispan.getSelectedCacheName(workspace) && Infinispan.getInterpreterMBean(workspace),
      href: () => "#/infinispan/query"
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
