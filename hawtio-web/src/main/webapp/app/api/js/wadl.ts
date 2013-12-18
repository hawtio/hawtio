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
        log.info("We have apidocs and jsonSchema!");
        enrichResources(jsonSchema, apidocs.resources)
      }
    }


    /**
     * Concatenate all the non-null arrays into a single array
     * @param arrays an array of arrays
     * @return the single flatten arrays with any null/undefined values ignored
     */
    function concatArrays(arrays: any[]) {
      var answer: any = [];
      angular.forEach(arrays, (array) => {
        if (array) {
          if (angular.isArray(array)) {
            answer = answer.concat(array);
          } else {
            answer.push(array);
          }
        }
      });
      return answer;
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
          if (foundDef) {
            log.info("Found def " + angular.toJson(foundDef) + " for element " + representation["element"]);
          }
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
