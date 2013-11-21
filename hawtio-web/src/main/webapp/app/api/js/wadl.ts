module API {

  export function WadlViewController($scope, $location, jolokia) {

    var search = $location.search();
    $scope.url = search["wadl"];
    $scope.container = search["container"];
    $scope.objectName = search["objectName"];

    if ($scope.container && $scope.objectName) {
      Fabric.containerJolokia(jolokia, $scope.container, (remoteJolokia) => {
        $scope.remoteJolokia = remoteJolokia;
        if (remoteJolokia) {
          API.loadJsonSchema(remoteJolokia, $scope.objectName, (jsonSchema) => {
            log.info("Got JSON Schema: " + JSON.stringify(jsonSchema, null, "  "));
            $scope.jsonSchema = jsonSchema;
          })
        } else {
          log.info("No Remote Jolokia!");
        }
      });
    } else {
      log.info("No container or objectName");
    }

    var log:Logging.Logger = Logger.get("API3");

    log.info("container: " + $scope.container + " objectName: " + $scope.objectName + " url: " + $scope.url);

    var wadlNamespace = "http://schemas.xmlsoap.org/wsdl/";

    loadXml($scope.url, onWsdl);

    function onWsdl(response) {
      $scope.apidocs = API.onWadlXmlLoaded(response);
      //log.info("API docs: " + JSON.stringify($scope.apidocs, null, "  "));
      Core.$apply($scope);
    }
  }
}
