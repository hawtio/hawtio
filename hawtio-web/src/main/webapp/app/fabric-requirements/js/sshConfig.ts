/// <reference path="requirements.ts"/>
/// <reference path="../../forms/js/formGrid.ts"/>
module FabricRequirements {

  export var SshConfigController = controller("SshConfigController", ["$scope", "jolokia", "$templateCache", ($scope, jolokia, $templateCache) => {

    $scope.forms = {
      sshConfig: {

      }
    };

    $scope.tableTemplate = '';

    if (!$scope.requirements.sshConfiguration) {
      $scope.requirements.sshConfiguration = Fabric.createSshConfiguration();
    }
    if (!$scope.requirements.sshConfiguration.hosts) {
      $scope.requirements.sshConfiguration.hosts = <Array<Fabric.SshHostConfiguration>> [];
    }

    $scope.gridConfig = Forms.createFormGridConfiguration();

    $scope.$watch("requirements.sshConfiguration.hosts", (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.requirements.$dirty = true;
      }
    }, true);

    $scope.$watch("forms.sshConfig.$dirty", (newValue) => {
      if (newValue) {
        $scope.requirements.$dirty = true;
      }
    });

    $scope.onDrop = (data, model, property) => {
      log.debug("On drop - data: ", data, " model: ", model, " property: ", property);
    };

    $scope.$on('hawtio-drop', ($event, data) => {
      $scope.onDrop(data.data, data.model, data.property);
    });

    $scope.noop = () => {};

    Fabric.getDtoSchema(undefined, "io.fabric8.api.SshConfiguration", jolokia, (sshConfigurationSchema) => {
      Fabric.getDtoSchema(undefined, "io.fabric8.api.SshHostConfiguration", jolokia, (hostConfigurationSchema) => {

        // Override these elements since they're passwords
        ['defaultPassword', 'defaultPassPhrase'].forEach((s) => {
          Core.pathSet(sshConfigurationSchema, ['properties', s, 'type'], 'password');
        });
        ['password', 'passPhrase'].forEach((s) => {
          Core.pathSet(hostConfigurationSchema, ['properties', s, 'type'], 'password');
        });

        // Order the form elements nicely
        sshConfigurationSchema['tabs'] = {
          'Defaults': ['defaultUsername', 'defaultPassword', 'defaultPort', 'defaultPrivateKeyFile', 'defaultPassPhrase', 'defaultPath', '*']
        };

        // We don't want the form plugin to handle this guy
        delete sshConfigurationSchema.properties.hosts;

        $scope.gridConfig.rowSchema = hostConfigurationSchema;

        // Order the columns in the hosts config nicely
        $scope.gridConfig.rowName = "host";
        $scope.gridConfig.heading = true;
        $scope.gridConfig.noDataTemplate = $templateCache.get('noDataTemplate');
        $scope.gridConfig.rowSchema.columnOrder = ['hostName', 'port', 'username', 'password', 'privateKeyFile', 'passPhrase', 'path', 'preferredAddress', 'tags'];

        Core.pathSet($scope.gridConfig, ['rowSchema', 'properties', 'tags', 'template'], $templateCache.get('tagCell.html'));

        $scope.gridConfig.rows = $scope.requirements.sshConfiguration.hosts;
        $scope.gridConfig.onAdd = () => {
          var answer = Fabric.createSshHostConfiguration();
          answer.hostName = 'New Host';
          return answer;
        };

        log.debug("gridConfig: ", $scope.gridConfig);

        $scope.formConfig = sshConfigurationSchema;

        $scope.tableTemplate = $templateCache.get('tableTemplate');
        Core.$apply($scope);
      });
    });
  }]);
}
