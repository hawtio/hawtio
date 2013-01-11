module Camel {
  angular.module('camel', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
            $routeProvider.
                    when('/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html', controller: BrowseEndpointController}).
                    when('/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', controller: SendMessageController}).
                    when('/routes', {templateUrl: 'app/camel/html/routes.html'}).
                    when('/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html', controller: EndpointController}).
                    when('/traceRoute', {templateUrl: 'app/camel/html/traceRoute.html', controller: TraceRouteController});
          });
}
