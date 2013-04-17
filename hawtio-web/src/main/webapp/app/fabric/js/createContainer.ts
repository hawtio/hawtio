module Fabric {

  export function CreateContainerController($scope, $window, workspace, jolokia) {
    $scope.activeTab = 'org.fusesource.fabric.api.CreateContainerChildOptions';
    $scope.schema = {};
    $scope.entity = {};

    $scope.render = (response) => {
      $scope.schema = $.parseJSON(response.value);
      $scope.schema.description = '';
      angular.forEach($scope.schema.properties, (value, key) => {
        if (!value) {
          delete $scope.schema.properties[key];
        }
      });

      $scope.entity['number'] = 1;

      delete $scope.schema.properties['metadataMap'];
      delete $scope.schema.properties['zookeeperUrl'];
      delete $scope.schema.properties['zookeeperPassword'];

      switch($scope.activeTab) {

        case 'org.fusesource.fabric.api.CreateContainerChildOptions':
          $scope.entity['providerType'] = 'child';

          delete $scope.schema.properties['preferredAddress'];
          delete $scope.schema.properties['resolver'];
          delete $scope.schema.properties['ensembleServer'];
          delete $scope.schema.properties['proxyUri'];
          delete $scope.schema.properties['adminAccess'];

          break;

        case 'org.fusesource.fabric.api.CreateSshContainerOptions':
          $scope.entity['providerType'] = 'ssh';
          delete $scope.schema.properties['parent'];
          break;

        case 'org.fusesource.fabric.api.CreateJCloudsContainerOptions':
          $scope.entity['providerType'] = 'jclouds';
          delete $scope.schema.properties['parent'];
          break;
      }
      $scope.$apply();
    }

    $scope.onSubmit = (json, form) => {

      jolokia.request({
        type: 'exec', mbean: managerMBean,
        operation: 'createContainers(java.util.Map)',
        arguments: [JSON.stringify(json)]
      }, {
        success: (response) => {

          var error = false;
          angular.forEach(response.value, function(value, key) {
            error = true;
            notification('error', "Creating container " + key + " failed: " + value);
          });
          if (!error) {
            notification('success', "Successfully created containers");
            // Grrr, $location.path wasn't working here :-/
            $window.location = '#/fabric/containers';
          }
        },
        error: (response) => {
          notification('error', "Error creating containers: " + response.error);
        }
      });

      notification('info', "Requesting that new container(s) be created");
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
