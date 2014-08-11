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

    $scope.removeHost = (host:Fabric.SshHostConfiguration) => {
      var removed = $scope.requirements.sshConfiguration.hosts.remove((h:Fabric.SshHostConfiguration) => {
        var answer = h.hostName === host.hostName;
        if (answer) {
          $scope.requirements.$dirty = true;
        }
        return answer;
      });
    };

    $scope.noop = () => {};

    $scope.addHost = () => {
      $scope.requirements.sshConfiguration.hosts.push({
        hostName: 'newHost',
        username: null,
        password: null,
        port: null,
        privateKeyFile: null,
        passPhrase: null,
        maximumContainerCount: null,
        path: null,
        preferredAddress: null,
        tags: []
      });
      $scope.requirements.$dirty = true;
    };

    Fabric.getDtoSchema(undefined, "io.fabric8.api.SshConfiguration", jolokia, (sshConfigurationSchema) => {
      Fabric.getDtoSchema(undefined, "io.fabric8.api.SshHostConfiguration", jolokia, (hostConfigurationSchema) => {

        Core.pathSet(sshConfigurationSchema, ['properties', 'hosts', 'formTemplate'], $templateCache.get("hostsTemplate.html"));

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
