/**
 * @module API
 */
module API {

  export function WadlViewController($scope, $location, jolokia) {

    API.initScope($scope, $location, jolokia);

    $scope.url = $location.search()["wadl"];
    loadXml($scope.url, onWsdl);

    function onWsdl(response) {
      $scope.apidocs = API.onWadlXmlLoaded(response);
      //log.info("API docs: " + JSON.stringify($scope.apidocs, null, "  "));
      Core.$apply($scope);
    }
  }
}
