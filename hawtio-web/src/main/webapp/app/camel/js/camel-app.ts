module Camel {
  angular.module('camel', ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html', controller: BrowseEndpointController}).
                    when('/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', controller: SendMessageController}).
                    when('/routes', {templateUrl: 'app/camel/html/routes.html'}).
                    when('/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html', controller: EndpointController}).
                    when('/traceRoute', {templateUrl: 'app/camel/html/traceRoute.html', controller: TraceRouteController});

  }).
          run((workspace: Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['routes'] = () => workspace.isCamelFolder();
            map['createEndpoint'] = () => workspace.isEndpointsFolder();
            map['traceRoute'] = () => workspace.isRoute();

            // add sub level tabs
            workspace.subLevelTabs.push( {
              content: '<i class="icon-picture"></i> Diagram',
              title: "View a diagram of the Camel routes",
              isValid: () => workspace.isCamelFolder(),
              href: () => "#/routes"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-envelope"></i> Browse',
              title: "Browse the messages on the endpoint",
              isValid: () => workspace.isEndpointFolder(),
              href: () => "#/browseEndpoint"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-envelope"></i> Trace',
              title: "Trace the messages flowing through the Camel route",
              isValid: () => workspace.isRoute(),
              href: () => "#/traceRoute"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-pencil"></i> Send',
              title: "Send a message to this endpoint",
              isValid: () => workspace.isEndpointFolder(),
              href: () => "#/sendMessage"
            });
            workspace.subLevelTabs.push( {
              content: '<i class="icon-plus"></i> Create Endpoint',
              title: "Create a new endpoint",
              isValid: () => workspace.isEndpointsFolder(),
              href: () => "#/createEndpoint"
            });

          });

  hawtioPluginLoader.addModule('camel');
}
