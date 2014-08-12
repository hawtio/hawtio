/// <reference path="requirements.ts"/>
/// <reference path="../../forms/js/baseDirectives.ts"/>
/// <reference path="../../forms/js/inputTableDirective.ts"/>
module FabricRequirements {

  export var SshConfigController = controller("SshConfigController", ["$scope", "jolokia", "$templateCache", ($scope, jolokia, $templateCache) => {

    $scope.forms = {
      sshConfig: {

      }
    };

    $scope.$watch("forms.sshConfig.$dirty", (newValue) => {
      if (newValue) {
        $scope.requirements.$dirty = true;
      }
    });

    $scope.removeHost = ($index) => {
      $scope.requirements.sshConfiguration.hosts.removeAt($index);
      $scope.requirements.$dirty = true;
    };

    $scope.noop = () => {};

    $scope.addHost = () => {
      if (!$scope.requirements.sshConfiguration) {
        $scope.requirements.sshConfiguration = Fabric.createSshConfiguration();
      }
      if (!$scope.requirements.sshConfiguration.hosts) {
        $scope.requirements.sshConfiguration.hosts = <Array<Fabric.SshHostConfiguration>> [];
      }
      var newHost = Fabric.createSshHostConfiguration();
      newHost.hostName = 'newHost';
      $scope.requirements.sshConfiguration.hosts.push(newHost);
      $scope.requirements.$dirty = true;
    };

    Fabric.getDtoSchema(undefined, "io.fabric8.api.SshConfiguration", jolokia, (sshConfigurationSchema) => {
      Fabric.getDtoSchema(undefined, "io.fabric8.api.SshHostConfiguration", jolokia, (hostConfigurationSchema) => {

        Core.pathSet(sshConfigurationSchema, ['properties', 'hosts', 'formTemplate'], $templateCache.get("hostsTemplate.html"));

        Core.pathSet(sshConfigurationSchema, ['properties', 'defaultPassword', 'type'], 'password');
        Core.pathSet(sshConfigurationSchema, ['properties', 'defaultPassPhrase', 'type'], 'password');

        sshConfigurationSchema['tabs'] = {
          'Defaults': ['defaultUsername', 'defaultPassword', 'defaultPort', 'defaultPrivateKeyFile', 'defaultPassPhrase', 'defaultPath', '*']
        };

        delete sshConfigurationSchema.properties.hosts;

        var hostsTableConfig = {
          selectedItems: [],
          data: 'requirements.sshConfiguration.hosts',
          columnDefs: <Array<any>>[]
        };

        angular.forEach(hostConfigurationSchema.properties, (value, key) => {
          log.debug("hostConfigSchema, key:", key, " value:", value);
          hostsTableConfig.columnDefs.push({
            field: key,
            displayName: key
          });
        });

        $scope.hostsTableConfig = hostsTableConfig;
        log.debug("Schema: ", sshConfigurationSchema);
        $scope.formConfig = sshConfigurationSchema;
        Core.$apply($scope);
      });
    });
  }]);
}
