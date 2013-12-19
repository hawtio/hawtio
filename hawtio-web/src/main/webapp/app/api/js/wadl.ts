/**
 * @module API
 */
module API {

  export function WadlViewController($scope, $location, $http, jolokia) {

    API.initScope($scope, $location, jolokia);

    $scope.url = $location.search()["wadl"];
    loadXml($scope.url, onWsdl);

    $scope.$watch("apidocs", enrichApiDocsWithSchema);
    $scope.$watch("jsonSchema", enrichApiDocsWithSchema);

    $scope.tryInvoke = (resource, method) => {
      if (resource) {
        var path = resource.fullPath || resource.path;
        if (path) {
          // lets substitue the parameters
          angular.forEach(resource.param, (param) => {
            var name = param.name;
            if (name) {
              var value = param.value;
              if (angular.isUndefined(value) || value === null) {
                value = "";
              }
              value = value.toString();
              log.debug("replacing " + name + " with '" + value +"'");
              path = path.replace(new RegExp("{" + name + "}", "g"), value);
            }
          });
          log.info("Lets invoke resource: " + path);
          var url = Core.useProxyIfExternal(path);
          var methodName = method.name || "GET";
          method.invoke = {
            url: url,
            running: true
          };
          $http({method: methodName, url: url}).
            success(function(data, status, headers, config) {
              log.info("Worked!" + data);
              method.invoke = {
                url: url,
                success: true,
                data: data,
                status: status,
                headers: headers(),
                config: config
              };
              Core.$apply($scope);
            }).
            error(function(data, status, headers, config) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              log.info("Failed: " + status);
              method.invoke = {
                url: url,
                data: data,
                status: status,
                headers: headers(),
                config: config
              };
              Core.$apply($scope);
            });
        }
      }
    };


    function enrichApiDocsWithSchema() {
      var apidocs = $scope.apidocs;
      var jsonSchema = $scope.jsonSchema;
      if (apidocs && jsonSchema) {
        enrichResources(jsonSchema, apidocs.resources)
      }
    }


    function enrichResources(jsonSchema, resources, parentUri = null) {
      angular.forEach(resources, (resource) => {
        var base = resource.base;
        if (base) {
          if (parentUri) {
            base = parentUri + base;
          }
        } else {
          base = parentUri;
        }
        var path = resource.path;
        if (base && path) {
          if (!base.endsWith("/") && !path.startsWith("/")) {
            base += "/";
          }
          base += path;
          resource["fullPath"] = base;
        }
        var childResources = resource.resource;
        if (childResources) {
          enrichResources(jsonSchema, childResources, base);
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
