/// <reference path="../../jmx/js/jmxHelpers.ts"/>
/// <reference path="camelHelpers.ts"/>
/**
 *
 * @module Camel
 * @main Camel
 */
module Camel {
  import jmxModule = Jmx;

  export var pluginName = 'camel';

  var routeToolBar = "app/camel/html/attributeToolBarRoutes.html";
  var contextToolBar = "app/camel/html/attributeToolBarContext.html";

  export var _module = angular.module(pluginName, ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ui.bootstrap.tabs', 'ui.bootstrap.typeahead', 'ngResource', 'hawtioCore', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/camel/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html'}).
            when('/camel/endpoint/browse/:contextId/*endpointPath', {templateUrl: 'app/camel/html/browseEndpoint.html'}).
            when('/camel/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html'}).
            when('/camel/route/diagram/:contextId/:routeId', {templateUrl: 'app/camel/html/routes.html'}).
            when('/camel/routes', {templateUrl: 'app/camel/html/routes.html'}).
            when('/camel/fabricDiagram', {templateUrl: 'app/camel/html/fabricDiagram.html', reloadOnSearch: false}).
            when('/camel/typeConverter', {templateUrl: 'app/camel/html/typeConverter.html', reloadOnSearch: false}).
            when('/camel/restRegistry', {templateUrl: 'app/camel/html/restRegistry.html', reloadOnSearch: false}).
            when('/camel/routeMetrics', {templateUrl: 'app/camel/html/routeMetrics.html', reloadOnSearch: false}).
            when('/camel/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', reloadOnSearch: false}).
            when('/camel/source', {templateUrl: 'app/camel/html/source.html'}).
            when('/camel/traceRoute', {templateUrl: 'app/camel/html/traceRoute.html'}).
            when('/camel/debugRoute', {templateUrl: 'app/camel/html/debug.html'}).
            when('/camel/profileRoute', {templateUrl: 'app/camel/html/profileRoute.html'}).
            when('/camel/properties', {templateUrl: 'app/camel/html/properties.html'});
  }]);

  _module.factory('tracerStatus',function () {
    return {
      jhandle: null,
      messages: []
    };
  });

  _module.filter('camelIconClass', () => iconClass);

  _module.factory('activeMQMessage', () => {
      return { 'message' : null}
  });

  _module.run(["workspace", "jolokia", "viewRegistry", "layoutFull", "helpRegistry", "preferencesRegistry", (workspace:Workspace, jolokia, viewRegistry, layoutFull, helpRegistry, preferencesRegistry) => {

    viewRegistry['camel/endpoint/'] = layoutFull;
    viewRegistry['camel/route/'] = layoutFull;
    viewRegistry['camel/fabricDiagram'] = layoutFull;
    viewRegistry['camel'] = 'app/camel/html/layoutCamelTree.html';

    helpRegistry.addUserDoc('camel', 'app/camel/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties(jmxDomain);
    });
    preferencesRegistry.addTab('Camel', 'app/camel/html/preferences.html', () => {
      return workspace.treeContainsDomainAndProperties(jmxDomain); 
    });

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



    // register default attribute views
    var stateField = 'State';
    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(\'' + stateField + '\') | camelIconClass}}"></i></div>';
    var stateColumn = {field: stateField, displayName: stateField,
      cellTemplate: stateTemplate,
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      resizable: false,
      defaultSort: false
      // we do not want to default sort the state column
    };

    var attributes = workspace.attributeColumnDefs;
    attributes[jmxDomain + "/context/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'Uptime', displayName: 'Uptime', visible: false},
      {field: 'CamelVersion', displayName: 'Version', visible: false},
      {field: 'ExchangesCompleted', displayName: 'Completed #'},
      {field: 'ExchangesFailed', displayName: 'Failed #'},
      {field: 'FailuresHandled', displayName: 'Failed Handled #'},
      {field: 'ExchangesTotal', displayName: 'Total #', visible: false},
      {field: 'InflightExchanges', displayName: 'Inflight #'},
      {field: 'MeanProcessingTime', displayName: 'Mean Time'},
      {field: 'MinProcessingTime', displayName: 'Min Time'},
      {field: 'MaxProcessingTime', displayName: 'Max Time'},
      {field: 'TotalProcessingTime', displayName: 'Total Time', visible: false},
      {field: 'LastProcessingTime', displayName: 'Last Time', visible: false},
      {field: 'LastExchangeCompletedTimestamp', displayName: 'Last completed', visible: false},
      {field: 'LastExchangeFailedTimestamp', displayName: 'Last failed', visible: false},
      {field: 'Redeliveries', displayName: 'Redelivery #', visible: false},
      {field: 'ExternalRedeliveries', displayName: 'External Redelivery #', visible: false}
    ];
    attributes[jmxDomain + "/routes/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'RouteId', displayName: 'Route'},
      {field: 'ExchangesCompleted', displayName: 'Completed #'},
      {field: 'ExchangesFailed', displayName: 'Failed #'},
      {field: 'FailuresHandled', displayName: 'Failed Handled #'},
      {field: 'ExchangesTotal', displayName: 'Total #', visible: false},
      {field: 'InflightExchanges', displayName: 'Inflight #'},
      {field: 'MeanProcessingTime', displayName: 'Mean Time'},
      {field: 'MinProcessingTime', displayName: 'Min Time'},
      {field: 'MaxProcessingTime', displayName: 'Max Time'},
      {field: 'TotalProcessingTime', displayName: 'Total Time', visible: false},
      {field: 'DeltaProcessingTime', displayName: 'Delta Time', visible: false},
      {field: 'LastProcessingTime', displayName: 'Last Time', visible: false},
      {field: 'LastExchangeCompletedTimestamp', displayName: 'Last completed', visible: false},
      {field: 'LastExchangeFailedTimestamp', displayName: 'Last failed', visible: false},
      {field: 'Redeliveries', displayName: 'Redelivery #', visible: false},
      {field: 'ExternalRedeliveries', displayName: 'External Redelivery #', visible: false}
    ];
    attributes[jmxDomain + "/processors/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'RouteId', displayName: 'Route'},
      {field: 'ProcessorId', displayName: 'Processor'},
      {field: 'ExchangesCompleted', displayName: 'Completed #'},
      {field: 'ExchangesFailed', displayName: 'Failed #'},
      {field: 'FailuresHandled', displayName: 'Failed Handled #'},
      {field: 'ExchangesTotal', displayName: 'Total #', visible: false},
      {field: 'InflightExchanges', displayName: 'Inflight #'},
      {field: 'MeanProcessingTime', displayName: 'Mean Time'},
      {field: 'MinProcessingTime', displayName: 'Min Time'},
      {field: 'MaxProcessingTime', displayName: 'Max Time'},
      {field: 'TotalProcessingTime', displayName: 'Total Time', visible: false},
      {field: 'LastProcessingTime', displayName: 'Last Time', visible: false},
      {field: 'LastExchangeCompletedTimestamp', displayName: 'Last completed', visible: false},
      {field: 'LastExchangeFailedTimestamp', displayName: 'Last failed', visible: false},
      {field: 'Redeliveries', displayName: 'Redelivery #', visible: false},
      {field: 'ExternalRedeliveries', displayName: 'External Redelivery #', visible: false}
    ];
    attributes[jmxDomain + "/components/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'ComponentName', displayName: 'Name'}
    ];
    attributes[jmxDomain + "/consumers/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'RouteId', displayName: 'Route'},
      {field: 'EndpointUri', displayName: 'Endpoint URI', width: "**"},
      {field: 'Suspended', displayName: 'Suspended', resizable: false},
      {field: 'InflightExchanges', displayName: 'Inflight #'}
    ];
    attributes[jmxDomain + "/services/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'RouteId', displayName: 'Route'},
      {field: 'Suspended', displayName: 'Suspended', resizable: false},
      {field: 'SupportsSuspended', displayName: 'Can Suspend', resizable: false}
    ];
    attributes[jmxDomain + "/endpoints/folder"] = [
      stateColumn,
      {field: 'CamelId', displayName: 'Context'},
      {field: 'EndpointUri', displayName: 'Endpoint URI', width: "***"},
      {field: 'Singleton', displayName: 'Singleton', resizable: false }
    ];
    attributes[jmxDomain + "/threadpools/folder"] = [
      {field: 'Id', displayName: 'Id', width: "**"},
      {field: 'ActiveCount', displayName: 'Active #'},
      {field: 'PoolSize', displayName: 'Pool Size'},
      {field: 'CorePoolSize', displayName: 'Core Pool Size'},
      {field: 'TaskQueueSize', displayName: 'Task Queue Size'},
      {field: 'TaskCount', displayName: 'Task #'},
      {field: 'CompletedTaskCount', displayName: 'Completed Task #'}
    ];
    attributes[jmxDomain + "/errorhandlers/folder"] = [
      {field: 'CamelId', displayName: 'Context'},
      {field: 'DeadLetterChannel', displayName: 'Dead Letter'},
      {field: 'DeadLetterChannelEndpointUri', displayName: 'Endpoint URI', width: "**", resizable: true},
      {field: 'MaximumRedeliveries', displayName: 'Max Redeliveries'},
      {field: 'RedeliveryDelay', displayName: 'Redelivery Delay'},
      {field: 'MaximumRedeliveryDelay', displayName: 'Max Redeliveries Delay'}
    ];

    workspace.topLevelTabs.push({
      id: "camel",
      content: "Camel",
      title: "Manage your Apache Camel applications",
      isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
      href: () => "#/jmx/attributes?tab=camel",
      isActive: (workspace: Workspace) => workspace.isTopTabActive("camel")
    });

    // add sub level tabs

    // special for route diagram as we want this to be the 1st
    workspace.subLevelTabs.push({
      content: '<i class="icon-picture"></i> Route Diagram',
      title: "View a diagram of the Camel routes",
      isValid: (workspace: Workspace) => workspace.isRoute(),
      href: () => "#/camel/routes",
      // make sure we have route diagram shown first
      index: -2
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-bar-chart"></i> Route Metrics',
      title: "View the entire JVMs Camel route metrics",
      isValid: (workspace: Workspace) => !workspace.isEndpointsFolder()
        && (workspace.isRoute() || workspace.isRoutesFolder() || workspace.isCamelContext())
        && Camel.isCamelVersionEQGT(2, 14, workspace, jolokia),
      href: () => "#/camel/routeMetrics"
    });
    workspace.subLevelTabs.push({
      content: '<i class=" icon-file-alt"></i> Source',
      title: "View the source of the Camel routes",
      isValid: (workspace: Workspace) => !workspace.isEndpointsFolder()
        && (workspace.isRoute() || workspace.isRoutesFolder() || workspace.isCamelContext()),
      href: () => "#/camel/source"
    });
    workspace.subLevelTabs.push({
      content: '<i class=" icon-edit"></i> Properties',
      title: "View the pattern properties",
      isValid: (workspace: Workspace) => getSelectedRouteNode(workspace),
      href: () => "#/camel/properties"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-list"></i> Type Converters',
      title: "List all the type converters registered in the context",
      isValid: (workspace: Workspace) => workspace.isTopTabActive("camel")
        && !workspace.isEndpointsFolder() && !workspace.isRoute()
        && Camel.isCamelVersionEQGT(2, 13, workspace, jolokia),
      href: () => "#/camel/typeConverter"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-list"></i> Rest Services',
      title: "List all the REST services registered in the context",
      isValid: (workspace: Workspace) => workspace.isTopTabActive("camel")
        && !workspace.isEndpointsFolder() && !workspace.isRoute()
        && Camel.isCamelVersionEQGT(2, 14, workspace, jolokia),
      href: () => "#/camel/restRegistry"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-envelope"></i> Browse',
      title: "Browse the messages on the endpoint",
      isValid: (workspace: Workspace) => workspace.isEndpoint(),
      href: () => "#/camel/browseEndpoint"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-stethoscope"></i> Debug',
      title: "Debug the Camel route",
      isValid: (workspace: Workspace) => workspace.isRoute()
        && Camel.getSelectionCamelDebugMBean(workspace),
      href: () => "#/camel/debugRoute"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-envelope"></i> Trace',
      title: "Trace the messages flowing through the Camel route",
      isValid: (workspace: Workspace) => workspace.isRoute()
        && Camel.getSelectionCamelTraceMBean(workspace),
      href: () => "#/camel/traceRoute"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-bar-chart"></i> Profile',
      title: "Profile the messages flowing through the Camel route",
      isValid: (workspace: Workspace) => workspace.isRoute()
        && Camel.getSelectionCamelTraceMBean(workspace),
      href: () => "#/camel/profileRoute"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-pencil"></i> Send',
      title: "Send a message to this endpoint",
      isValid: (workspace: Workspace) => workspace.isEndpoint(),
      href: () => "#/camel/sendMessage"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-plus"></i> Endpoint',
      title: "Create a new endpoint",
      isValid: (workspace: Workspace) => workspace.isEndpointsFolder(),
      href: () => "#/camel/createEndpoint"
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);

  // register the jmx lazy loader here as it won't have been invoked in the run method
  hawtioPluginLoader.registerPreBootstrapTask((task) => {
    jmxModule.registerLazyLoadHandler(jmxDomain, (folder:Folder) => {
      if (jmxDomain === folder.domain && "routes" === folder.typeName) {
        return (workspace, folder, onComplete) => {
          if ("routes" === folder.typeName) {
            processRouteXml(workspace, workspace.jolokia, folder, (route) => {
              if (route) {
                addRouteChildren(folder, route);
              }
              onComplete();
            });
          } else {
            onComplete();
          }
        }
      }
      return null;
    });
    task();
  });
}
