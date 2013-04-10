module Fabric {

  export function CreateContainerController($scope, $location, workspace, jolokia) {
    $scope.activeTab = 'org.fusesource.fabric.api.CreateContainerChildOptions';
    $scope.schema = {};
    $scope.entity = {};

    $scope.render = (response) => {
      $scope.schema = $.parseJSON(response.value);
      console.log("Got: ", $scope.schema);
      $scope.schema.description = '';
      angular.forEach($scope.schema.properties, (value, key) => {
        if (!value) {
          delete $scope.schema.properties[key];
        }
      });
      $scope.$apply();
    }


    $scope.$watch('activeTab', () => {

      jolokia.request({
        type: 'exec', mbean: 'io.hawt.jsonschema:type=SchemaLookup',
        operation: 'getSchemaForClass(java.lang.String)',
        arguments: [$scope.activeTab]
      }, onSuccess($scope.render));

    });
  }

}
