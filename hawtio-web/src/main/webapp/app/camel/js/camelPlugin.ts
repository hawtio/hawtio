module Camel {
  var pluginName = 'camel';
  var jmxDomain = 'org.apache.camel';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/camel/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html', controller: BrowseEndpointController}).
                    when('/camel/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', controller: SendMessageController}).
                    when('/camel/routes', {templateUrl: 'app/camel/html/routes.html'}).
                    when('/camel/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html', controller: EndpointController}).
                    when('/camel/traceRoute', {templateUrl: 'app/camel/html/traceRoute.html', controller: TraceRouteController})
          }).
          run((workspace:Workspace) => {

            Jmx.addAttributeToolBar(pluginName, jmxDomain, (selection: NodeSelection) => {
              var folderNames = selection.folderNames;
              if (folderNames && selection.domain === jmxDomain) {
                var last = folderNames.last();
                if ("routes" === last) {
                  return "app/camel/html/attributesToolBarRoutes.html";
                }
              }
              return null;
            });

            // register default attribute views
            var attributes = workspace.attributeColumnDefs;
            attributes[jmxDomain + "/consumers/folder"] = [
              {field: 'CamelId', displayName: 'Context'},
              {field: 'RouteId', displayName: 'Route'},
              {field: 'EndpointUri', displayName: 'Endpoint URI'},
              {field: 'State', displayName: 'State'},
              {field: 'Suspended', displayName: 'Suspended'},
              {field: 'InflightExchanges', displayName: 'Inflight #'}
            ];
            attributes[jmxDomain + "/processors/folder"] = [
              {field: 'CamelId', displayName: 'Context'},
              {field: 'RouteId', displayName: 'Route'},
              {field: 'ProcessorId', displayName: 'Processor'},
              {field: 'State', displayName: 'State'},
              {field: 'ExchangesCompleted', displayName: 'Completed #'},
              {field: 'ExternalRedeliveries', displayName: 'Redeliveries %'},
              {field: 'TotalProcessingTime', displayName: 'Total Time'},
              {field: 'MinProcessingTime', displayName: 'Min Time'},
              {field: 'MaxProcessingTime', displayName: 'Max Time'}
            ];
            attributes[jmxDomain + "/routes/folder"] = [
              {field: 'CamelId', displayName: 'Context'},
              {field: 'RouteId', displayName: 'Route'},
              {field: 'State', displayName: 'State'},
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
