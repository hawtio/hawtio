/**
 * @module API
 */
module API {

  export function WadlViewController($scope, $location, jolokia) {

    API.initScope($scope, $location, jolokia);

    $scope.url = $location.search()["wadl"];
    loadXml($scope.url, onWsdl);

    $scope.$watch("apidocs", enrichApiDocsWithSchema);
    $scope.$watch("jsonSchema", enrichApiDocsWithSchema);

    function enrichApiDocsWithSchema() {
      var apidocs = $scope.apidocs;
      var jsonSchema = $scope.jsonSchema;
      if (apidocs && jsonSchema) {
        enrichResources(jsonSchema, apidocs.resources)
      }
    }


    function enrichResources(jsonSchema, resources) {
      angular.forEach(resources, (resource) => {
        var childResources = resource.resource;
        if (childResources) {
          enrichResources(jsonSchema, childResources);
        }
        angular.forEach(concatArrays([resource.method, resource.operation]), (method) => {
          angular.forEach(concatArrays([method.request, method.response]), (object) => {
            angular.forEach(object["representation"], (representation) => {
              enrichRepresentation(jsonSchema, representation);
            })
          });
        });
      });
    }

    function enrichRepresentation(jsonSchema, representation) {
      var defs = jsonSchema ? jsonSchema["definitions"] : null;
      if (defs && representation) {
        // TODO find a class name in the representation?
        var element = representation["element"];
        if (element) {
          var idx = element.indexOf(':');
          if (idx >= 0) {
            element = element.substring(idx + 1);
          }

          // lets see if we can find a definition which ends with this element
          var elementPostfix = "." + element;
          var foundDef = null;
          angular.forEach(defs, (value, key) => {
            if (!foundDef && (key === element || key.endsWith(elementPostfix))) {
              foundDef = value;
              representation["schema"] = foundDef;
              representation["typeName"] = element;
              representation["javaClass"] = key;
            }
          });
        }
      }
    }

    function onWsdl(response) {
      $scope.apidocs = API.onWadlXmlLoaded(response);
      //log.info("API docs: " + JSON.stringify($scope.apidocs, null, "  "));
      Core.$apply($scope);
    }
  }
}
