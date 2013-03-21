module Infinispan {
  var pluginName = 'infinispan';
  export var jmxDomain = 'Infinispan';

  var toolBar = "app/infinispan/html/attributeToolBar.html";

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/infinispan/cache', {templateUrl: 'app/camel/html/cache.html'});
          }).
          filter('infinispanCacheName', () => infinispanCacheName).
          run((workspace:Workspace, viewRegistry) => {

            viewRegistry['infinispan'] = 'app/infinispan/html/layoutCacheTree.html';

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
            var nameTemplate = '<div class="ngCellText" title="Infinispan Cache">{{row.entity | infinispanCacheName}}</div>';

            var attributes = workspace.attributeColumnDefs;
            attributes[jmxDomain + "/Caches/folder"] = [
              {field: 'name', displayName: 'Name',
                cellTemplate: nameTemplate, width: "**" },
              {field: 'numberOfEntries', displayName: 'Entries'},
              {field: 'hits', displayName: 'Hits'},
              {field: 'hitRatio', displayName: 'Hit Ratio'},
              {field: 'stores', displayName: 'Stores'},
              {field: 'averageReadTime', displayName: 'Avg Read Time'},
              {field: 'averageWriteTime', displayName: 'Avg Write Time'}
            ];

            /*

             var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | camelIconClass}}"></i></div>';
             var stateColumn = {field: 'State', displayName: 'State',
             cellTemplate: stateTemplate,
             width: 56,
             minWidth: 56,
             maxWidth: 56,
             resizable: false
             };

             attributes[jmxDomain + "/consumers/folder"] = [
             stateColumn,
             {field: 'CamelId', displayName: 'Context'},
             {field: 'RouteId', displayName: 'Route'},
             {field: 'EndpointUri', displayName: 'Endpoint URI'},
             {field: 'Suspended', displayName: 'Suspended', resizable: false},
             {field: 'InflightExchanges', displayName: 'Inflight #'}
             ];
             attributes[jmxDomain + "/processors/folder"] = [
             stateColumn,
             {field: 'CamelId', displayName: 'Context'},
             {field: 'RouteId', displayName: 'Route'},
             {field: 'ProcessorId', displayName: 'Processor'},
             {field: 'ExchangesCompleted', displayName: 'Completed #'},
             {field: 'ExternalRedeliveries', displayName: 'Redeliveries %'},
             {field: 'TotalProcessingTime', displayName: 'Total Time'},
             {field: 'MinProcessingTime', displayName: 'Min Time'},
             {field: 'MaxProcessingTime', displayName: 'Max Time'}
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
             attributes[jmxDomain + "/routes/folder"] = [
             stateColumn,
             {field: 'CamelId', displayName: 'Context'},
             {field: 'RouteId', displayName: 'Route'},
             {field: 'ExchangesCompleted', displayName: 'Completed #'},
             {field: 'ExternalRedeliveries', displayName: 'Redeliveries %'},
             {field: 'TotalProcessingTime', displayName: 'Total Time'},
             {field: 'MeanProcessingTime', displayName: 'Mean Time'}
             ];
             */

            workspace.topLevelTabs.push({
              content: "Infinispan",
              title: "View your distributed data",
              isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
              href: () => "#/jmx/attributes?tab=infinispan",
              isActive: (workspace:Workspace) => workspace.isTopTabActive("infinispan")
            });

            /*            // add sub level tabs
             workspace.subLevelTabs.push({
             content: '<i class="icon-picture"></i> Diagram',
             title: "View a diagram of the Camel routes",
             isValid: (workspace: Workspace) => workspace.isCamelFolder(),
             href: () => "#/camel/routes"
             });
             workspace.subLevelTabs.push({
             content: '<i class=" icon-file-alt"></i> Source',
             title: "View the source of the Camel routes",
             isValid: (workspace: Workspace) => workspace.isCamelFolder(),
             href: () => "#/camel/source"
             });
             workspace.subLevelTabs.push({
             content: '<i class="icon-envelope"></i> Browse',
             title: "Browse the messages on the endpoint",
             isValid: (workspace: Workspace) => workspace.isEndpoint(),
             href: () => "#/camel/browseEndpoint"
             });
             workspace.subLevelTabs.push({
             content: '<i class="icon-envelope"></i> Trace',
             title: "Trace the messages flowing through the Camel route",
             isValid: (workspace: Workspace) => workspace.isRoute() && Camel.getSelectionCamelTraceMBean(workspace),
             href: () => "#/camel/traceRoute"
             });
             workspace.subLevelTabs.push({
             content: '<i class="icon-pencil"></i> Send',
             title: "Send a message to this endpoint",
             isValid: (workspace: Workspace) => workspace.isEndpoint(),
             href: () => "#/camel/sendMessage"
             });
             workspace.subLevelTabs.push({
             content: '<i class="icon-plus"></i> Create Endpoint',
             title: "Create a new endpoint",
             isValid: (workspace: Workspace) => workspace.isEndpointsFolder(),
             href: () => "#/camel/createEndpoint"
             });*/

          });

  hawtioPluginLoader.addModule(pluginName);
}
