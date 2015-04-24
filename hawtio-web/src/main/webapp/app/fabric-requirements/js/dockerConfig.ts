/// <reference path="requirements.ts"/>
/// <reference path="../../forms/js/formGrid.ts"/>
module FabricRequirements {

  export var DockerConfigController = controller("DockerConfigController", ["$scope", "jolokia", "$templateCache", ($scope, jolokia, $templateCache:ng.ITemplateCacheService) => {

    $scope.gridConfig = Forms.createFormGridConfiguration();
    $scope.tableTemplate = '';

    if (!$scope.requirements.dockerConfiguration) {
      $scope.requirements.dockerConfiguration = Fabric.createDockerConfiguration();
    }

    if (!$scope.requirements.dockerConfiguration.hosts) {
      $scope.requirements.dockerConfiguration.hosts = <Array<Fabric.DockerHostConfiguration>> [];
    }

    $scope.$watch('requirements.dockerConfiguration.hosts', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.requirements.$dirty = true;
      }
    }, true);

    Fabric.getDtoSchema(undefined, "io.fabric8.api.DockerConfiguration", jolokia, (dockerConfigurationSchema) => {
      log.debug("Received dockerConfigurationSchema: ", dockerConfigurationSchema);
      Fabric.getDtoSchema(undefined, 'io.fabric8.api.DockerHostConfiguration', jolokia, (dockerHostConfigurationSchema) => {

        log.debug("Received dockerHostConfigurationSchema: ", dockerHostConfigurationSchema);

        ['password', 'passPhrase'].forEach((s) => {
          Core.pathSet(dockerHostConfigurationSchema, ['properties', s, 'type'], 'password');
        });
        ['maximumContainerCount', 'port'].forEach((s) => {
          Core.pathSet(dockerHostConfigurationSchema, ['properties', s, 'type'], 'integer');
          Core.pathSet(dockerHostConfigurationSchema, ['properties', s, 'input-attributes', 'min'], '1');
          Core.pathSet(dockerHostConfigurationSchema, ['properties', s, 'input-attributes', 'max'], '65535');
        });

        $scope.gridConfig.rowSchema = dockerHostConfigurationSchema;
        $scope.gridConfig.rowName = "docker host";
        $scope.gridConfig.heading = true;
        $scope.gridConfig.noDataTemplate = $templateCache.get('noDataTemplate');
        $scope.gridConfig.rowSchema.columnOrder = ['hostName', 'port', 'username', 'password', 'privateKeyFile', 'passPhrase', 'path', 'preferredAddress', 'tags'];
        Core.pathSet($scope.gridConfig, ['rowSchema', 'properties', 'tags', 'template'], $templateCache.get('tagCell.html'));
        $scope.gridConfig.rows = $scope.requirements.dockerConfiguration.hosts;
        $scope.gridConfig.onAdd = () => {
          var answer = Fabric.createDockerHostConfiguration();
          answer.hostName = 'New Host';
          return answer;
        };

        $scope.tableTemplate = $templateCache.get('tableTemplate');

        Core.$apply($scope);
      })
    });
  }]);
}
