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

          });

  hawtioPluginLoader.addModule('camel');
}
