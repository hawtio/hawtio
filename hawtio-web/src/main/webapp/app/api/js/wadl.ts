module API {

  export function WadlViewController($scope, $location, jolokia) {

    $scope.url = $location.search()["wadl"];
    var log:Logging.Logger = Logger.get("API3");

    var wadlNamespace = "http://schemas.xmlsoap.org/wsdl/";

    loadXml($scope.url, onWsdl);

    function onWsdl(response) {
      $scope.apidocs = API.onWadlXmlLoaded(response);
      log.info("API docs: " + JSON.stringify($scope.apidocs, null, "  "));
      Core.$apply($scope);
    }
  }
}
