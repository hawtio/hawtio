module Camel {
  var pluginName = 'camel';
  var jmxDomain = 'org.apache.camel';

  var routeToolBar = "app/camel/html/attributeToolBarRoutes.html";
  var contextToolBar = "app/camel/html/attributeToolBarContext.html";

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/camel/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html'}).
                    when('/camel/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html'}).
                    when('/camel/routes', {templateUrl: 'app/camel/html/routes.html'}).
                    when('/camel/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html'}).
                    when('/camel/source', {templateUrl: 'app/camel/html/source.html'}).
                    when('/camel/traceRoute', {templateUrl: 'app/camel/html/traceRoute.html'})
          }).
          filter('camelIconClass', () => iconClass).
          run((workspace:Workspace, viewRegistry) => {

            viewRegistry['integration'] = 'app/camel/html/layoutCamelTree.html';

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
            var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | camelIconClass}}"></i></div>';
            var stateColumn = {field: 'State', displayName: 'State',
              cellTemplate: stateTemplate,
              width: 56,
              minWidth: 56,
              maxWidth: 56,
              resizable: false
            };

            var attributes = workspace.attributeColumnDefs;
            attributes[jmxDomain + "/components/folder"] = [
              stateColumn,
              {field: 'CamelId', displayName: 'Context'},
              {field: 'ComponentName', displayName: 'Name'}
            ];
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

            workspace.topLevelTabs.push({
              content: "Integration",
              title: "Manage your Apache Camel integration patterns",
              isValid: () => workspace.treeContainsDomainAndProperties(jmxDomain),
              href: () => "#/jmx/attributes?tab=integration",
              isActive: () => workspace.isTopTabActive("integration")
            });

            // add sub level tabs
            workspace.subLevelTabs.push({
              content: '<i class="icon-picture"></i> Diagram',
              title: "View a diagram of the Camel routes",
              isValid: () => workspace.isCamelFolder(),
              href: () => "#/camel/routes"
            });
            workspace.subLevelTabs.push({
              content: '<i class=" icon-file-alt"></i> Source',
              title: "View the source of the Camel routes",
              isValid: () => workspace.isCamelFolder(),
              href: () => "#/camel/source"
            });
            workspace.subLevelTabs.push({
              content: '<i class="icon-envelope"></i> Browse',
              title: "Browse the messages on the endpoint",
              isValid: () => workspace.isEndpoint(),
              href: () => "#/camel/browseEndpoint"
            });
            workspace.subLevelTabs.push({
              content: '<i class="icon-envelope"></i> Trace',
              title: "Trace the messages flowing through the Camel route",
              isValid: () => workspace.isRoute() && Camel.getSelectionCamelTraceMBean(workspace),
              href: () => "#/camel/traceRoute"
            });
            workspace.subLevelTabs.push({
              content: '<i class="icon-pencil"></i> Send',
              title: "Send a message to this endpoint",
              isValid: () => workspace.isEndpoint(),
              href: () => "#/camel/sendMessage"
            });
            workspace.subLevelTabs.push({
              content: '<i class="icon-plus"></i> Create Endpoint',
              title: "Create a new endpoint",
              isValid: () => workspace.isEndpointsFolder(),
              href: () => "#/camel/createEndpoint"
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
