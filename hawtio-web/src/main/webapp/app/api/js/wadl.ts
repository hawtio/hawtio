/**
 * @module API
 */
/// <reference path="apiPlugin.ts"/>
module API {

  _module.controller("API.WadlViewController", ["$scope", "$location", "$http", "jolokia", ($scope, $location, $http, jolokia) => {

    API.initScope($scope, $location, jolokia);

    var search = $location.search();
    $scope.url = search["wadl"];
    $scope.podId = search["podId"];
    $scope.port = search["port"];

    $scope.$watch("apidocs", enrichApiDocsWithSchema);
    $scope.$watch("jsonSchema", enrichApiDocsWithSchema);

    loadXml($scope.url, onWsdl);

    $scope.tryInvoke = (resource, method) => {
      var useProxy = true;
      if (resource) {
        var path = resource.fullPath || resource.path;
        if (path) {
          if ($scope.podId) {
            var idx = path.indexOf("://");
            if (idx > 0) {
              var pathWithoutProtocol = path.substring(idx + 3);
              var idx = pathWithoutProtocol.indexOf("/");
              if (idx > 0) {
                path = "/hawtio/pod/" + $scope.podId + ($scope.port ? "/" + $scope.port : "") + pathWithoutProtocol.substring(idx);
                useProxy = false;
              }
            }
          }

          // lets substitute the parameters
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
          var url = useProxy ? Core.useProxyIfExternal(path) : path;
          log.info("Lets invoke resource: " + url);
          var methodName = method.name || "GET";
          method.invoke = {
            url: url,
            running: true
          };
          var requestData = {
            method: methodName,
            url: url,
            headers: {
            }
          };
          if (methodName === "POST" || methodName === "PUT") {
            // lets see if we can find a payload
            angular.forEach(method.request, (request) => {
              if (!requestData["data"]) {
                requestData["data"] = request.value;
              }
              if (!requestData.headers["Content-Type"]) {
                  requestData.headers["Content-Type"] = request.contentType;
              }
            });
          }
          log.info("About to make request: " + angular.toJson(requestData));
          $http(requestData).
            success(function(data, status, headers, config) {
              log.info("Worked!" + data);
              method.invoke = {
                url: url,
                realUrl: path,
                success: true,
                data: data,
                dataMode: textFormat(headers),
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
                realUrl: path,
                data: data,
                dataMode: textFormat(headers),
                status: status,
                headers: headers(),
                config: config
              };
              Core.$apply($scope);
            });
        }
      }
    };


    function textFormat(headers) {
      return contentTypeTextFormat(headers("content-type"));
    }

    function contentTypeTextFormat(contentType) {
      if (contentType) {
        if (contentType.endsWith("xml")) {
          return "xml";
        }
        if (contentType.endsWith("html")) {
          return "html";
        }
        if (contentType.endsWith("json")) {
          return "json";
        }
      }
      return null;
    }

    function enrichApiDocsWithSchema() {
      var apidocs = $scope.apidocs;
      var jsonSchema = $scope.jsonSchema;
      if (apidocs) {
        enrichResources(jsonSchema, apidocs.resources, $scope.parentUri);
      }
    }


    function enrichResources(jsonSchema, resources, parentUri = null) {
      angular.forEach(resources, (resource) => {
        var base = resource.base;
        if (base) {
          if (parentUri) {
            // lets find the first / and replace the prefix
            if (base) {
              var idx = base.indexOf("/");
              if (idx > 0) {
                base = parentUri + base.substring(idx);
              }
            }
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
          // lets remove any empty requests
          var request = method.request;
          if (request) {
            var count = request.count((n) => n["representation"]);
            if (!count) {
              delete method.request;
            }
          }
          angular.forEach(concatArrays([method.request, method.response]), (object) => {
            var element = object["element"];
            var representations = object["representation"];
            if (representations) {
              var mediaTypes = representations.map(r => r["mediaType"]);
              object["mediaTypes"] = mediaTypes;
              if (mediaTypes && mediaTypes.length) {
                object["contentType"] = mediaTypes[0];
              }
            }
            angular.forEach(representations, (representation) => {
              if (!element) {
                element = representation["element"];
              }
              enrichRepresentation(jsonSchema, representation);
            });
            if (element) {
              object["element"] = element;
            }
          });
        });
      });
    }

    function enrichRepresentation(jsonSchema, representation) {
      var defs = jsonSchema ? jsonSchema["definitions"] : null;
      if (defs && representation) {
        var contentType = representation["mediaType"];
        if (contentType) {
          representation["dataMode"] = contentTypeTextFormat(contentType);
        }


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
  }]);
}
