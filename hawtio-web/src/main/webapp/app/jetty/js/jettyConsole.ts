module Jetty {
  export function JettyConsoleController($scope, $location:ng.ILocationService, jolokia) {

    // TODO: JMX urls same for different jetty versions?

    $scope.theContexts = jolokia.getAttribute("org.mortbay.jetty.plugin:type=jettywebappcontext,*");

    var theServer = jolokia.getAttribute("org.eclipse.jetty.server:type=server,id=0");
    $scope.theServer = theServer;

    $scope.startupTime = new Date(theServer.startupTime);

    $scope.webAppOperation = function webAppOperation(name,operation) {
      jolokia.execute("org.mortbay.jetty.plugin:type=jettywebappcontext,name="+name+",id=0",operation);
    };

    $scope.webServerOperation = function webServerOperation(operation) {
      jolokia.execute("org.eclipse.jetty.server:type=server,id=0",operation);
    };

    $scope.isEmpty = function isEmpty(map) {
      return Object.keys(map).length === 0;
    }
  }
}