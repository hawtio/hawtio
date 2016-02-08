/**
 * @module API
 */
/// <reference path="apiPlugin.ts"/>
module API {

  _module.controller("API.WsdlViewController", ["$scope", "$location", "jolokia", ($scope, $location, jolokia) => {

    var log:Logging.Logger = Logger.get("API");

    API.initScope($scope, $location, jolokia);
    var wsdlNamespace = "http://schemas.xmlsoap.org/wsdl/";

    $scope.url = $location.search()["wsdl"];
    loadXml($scope.url, onWsdl);

    $scope.$watch("services", enrichApiDocsWithSchema);
    $scope.$watch("jsonSchema", enrichApiDocsWithSchema);

    function enrichApiDocsWithSchema() {
      var services = $scope.services;
      var jsonSchema = $scope.jsonSchema;
      if (services && jsonSchema) {
        log.info("We have services and jsonSchema!");
        enrichServices(jsonSchema, services)
      }
    }


    function enrichServices(jsonSchema, services) {
      angular.forEach(services, (service) => {
        angular.forEach(service.operations, (method) => {
          angular.forEach(concatArrays([method.inputs, method.outputs]), (object) => {
            enrichRepresentation(jsonSchema, object);
          });
        });
      });
    }

    function enrichRepresentation(jsonSchema, representation) {
      var defs = jsonSchema ? jsonSchema["definitions"] : null;
      if (defs && representation) {
        var name = representation["name"];
        if (name) {
          var foundDef = defs[name];
          if (foundDef) {
            // unwrap arrays
            if (angular.isArray(foundDef) && foundDef.length > 0) {
              foundDef = foundDef[0];
            }
            log.info("Found def " + angular.toJson(foundDef) + " for name " + name);
            representation["schema"] = foundDef;
          }
        }
      }
    }

    function onWsdl(response) {
      $scope.services = [];
      var root = response.documentElement;
      var targetNamespace = root ? root.getAttribute("targetNamespace") : null;
      var name = root ? root.getAttribute("name") : null;
      var portTypes = response.getElementsByTagNameNS(wsdlNamespace, "portType");
      var services = response.getElementsByTagNameNS(wsdlNamespace, "service");
      var bindings = response.getElementsByTagNameNS(wsdlNamespace, "binding");

      angular.forEach(portTypes, (portType) => {
        var service = {
          name: name,
          targetNamespace: targetNamespace,
          portName: portType.getAttribute("name") || "Unknown",
          operations: []
        };
        $scope.services.push(service);
        var operations = portType.getElementsByTagNameNS(wsdlNamespace, "operation");
        angular.forEach(operations, (operation) => {
          var input = operation.getElementsByTagNameNS(wsdlNamespace, "input");
          var output = operation.getElementsByTagNameNS(wsdlNamespace, "output");

          function createMessageData(data) {
            var answer = [];
            angular.forEach(data, (item) => {
              var name = item.getAttribute("name");
              if (name) {
                answer.push({
                  name: name
                });
              }
            });
            return answer;
          }

          var opData = {
            name: operation.getAttribute("name") || "Unknown",
            inputs: createMessageData(input),
            outputs: createMessageData(output)
          };
          service.operations.push(opData);
        });
      });
      Core.$apply($scope);
    }
  }]);
}
