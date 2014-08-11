/// <reference path="requirements.ts"/>
module FabricRequirements {

  export var DockerConfigController = controller("DockerConfigController", ["$scope", "jolokia", ($scope, jolokia) => {

    $scope.forms = {};
    Fabric.getDtoSchema(undefined, "io.fabric8.api.DockerConfiguration", jolokia, (schema) => {
      log.debug("Received schema: ", schema);
      // in case we ever have default settings for docker
      schema['tabs'] = {
        'Hosts': ['hosts']//,
        //'Defaults': ['*']
      };
      $scope.formConfig = schema;
      Core.$apply($scope);
    });
  }]);
}
