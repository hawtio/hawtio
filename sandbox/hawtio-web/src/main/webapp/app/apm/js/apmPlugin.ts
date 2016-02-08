/// <reference path="../../jmx/js/jmxHelpers.ts"/>
/// <reference path="apmHelpers.ts"/>
/**
 *
 * @module Apm
 * @main Apm
 */
module Apm {
  import jmxModule = Jmx;

  export var pluginName = 'apm';

  export var _module = angular.module(pluginName, ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ui.bootstrap.tabs', 'ui.bootstrap.typeahead', 'ngResource', 'hawtioCore', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
/*
            when('/apm/properties', {templateUrl: 'app/apm/html/properties.html'});
*/
  }]);

  _module.run(["workspace", "jolokia", "viewRegistry", "layoutFull", "helpRegistry", "preferencesRegistry", (workspace:Workspace, jolokia, viewRegistry, layoutFull, helpRegistry, preferencesRegistry) => {

    viewRegistry['apm'] = 'app/apm/html/layoutApmTree.html';

    helpRegistry.addUserDoc('apm', 'app/apm/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties(jmxDomain);
    });
/*
    preferencesRegistry.addTab('Apm', 'app/apm/html/preferences.html', () => {
      return workspace.treeContainsDomainAndProperties(jmxDomain); 
    });
*/

/*
    // TODO should really do this via a service that the JMX plugin exposes
    Jmx.addAttributeToolBar(pluginName, jmxDomain, (selection: NodeSelection) => {
      // TODO there should be a nicer way to do this!
      var typeName = selection.typeName;
      if (typeName) {
        if (typeName.startsWith("context")) return contextToolBar;
        if (typeName.startsWith("route")) return routeToolBar;
      }
      var folderNames = selection.folderNames;
      if (folderNames && selection.domain === jmxDomain) {
        var last = folderNames.last();
        if ("routes" === last)  return routeToolBar;
        if ("context" === last)  return contextToolBar;
      }
      return null;
    });
*/
/*
    // register default attribute views
    var stateField = 'State';
    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(\'' + stateField + '\') | apmIconClass}}"></i></div>';
    var stateColumn = {field: stateField, displayName: stateField,
      cellTemplate: stateTemplate,
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      resizable: false,
      defaultSort: false
      // we do not want to default sort the state column
    };
*/

    var attributes = workspace.attributeColumnDefs;
    attributes[jmxDomain + "/MethodMetrics/folder"] = [
      {field: 'Name', displayName: 'Name'},
      {field: 'Count', displayName: 'Count'}
    ];
    attributes[jmxDomain + "/ThreadContextMetrics/folder"] = [
      {field: 'Name', displayName: 'Name'},
      {field: 'ThreadName', displayName: 'Thread'},
      {field: 'Count', displayName: 'Count'}
    ];

/*

    workspace.topLevelTabs.push({
      id: "apm",
      content: "Apm",
      title: "Manage your Apache Apm applications",
      isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
      href: () => "#/jmx/attributes?tab=apm",
      isActive: (workspace: Workspace) => workspace.isTopTabActive("apm")
    });
*/

    // add sub level tabs
/*
    workspace.subLevelTabs.push({
      content: '<i class="icon-picture"></i> Diagram',
      title: "View a diagram of the Apm routes",
      isValid: (workspace: Workspace) => workspace.isRoute(),
      href: () => "#/apm/routes"
    });
*/

    function postProcessTree(tree) {
      var apmTree = tree.get(jmxDomain);

      // lets set the child nodes of ThreadContextMetrics to have a typeName of ThreadContextMetrics too
      if (apmTree) {
        angular.forEach(apmTree.children, (folder) => {
          if (folder.title === "ThreadContextMetrics") {
            angular.forEach(folder.children, (child) => {
              if (!child.typeName) {
                child.typeName = "ThreadContextMetrics";
              }
            });
          }
        });
      }
    }
    workspace.addTreePostProcessor(postProcessTree);

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
