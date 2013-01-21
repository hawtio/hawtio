module Camel {
  var pluginName = 'camel';
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
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['camel/routes'] = () => workspace.isCamelFolder();
            map['camel/createEndpoint'] = () => workspace.isEndpointsFolder();
            map['camel/traceRoute'] = () => workspace.isRoute();

            workspace.topLevelTabs.push({
              content: "Integration",
              title: "Manage your Apache Camel integration patterns",
              isValid: () => workspace.treeContainsDomainAndProperties('org.apache.camel'),
              href: () => url("#/jmx/attributes?tab=integration"),
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
