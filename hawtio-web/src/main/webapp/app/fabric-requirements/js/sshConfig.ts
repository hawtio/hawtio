/// <reference path="requirements.ts"/>
/// <reference path="../../forms/js/inputTableDirective.ts"/>
module FabricRequirements {

  export var SshConfigController = controller("SshConfigController", ["$scope", "jolokia", ($scope, jolokia) => {

    $scope.forms = {};

    Fabric.getDtoSchema(undefined, "io.fabric8.api.SshConfiguration", jolokia, (sshConfigurationSchema) => {
      Fabric.getDtoSchema(undefined, "io.fabric8.api.SshHostConfiguration", jolokia, (hostConfigurationSchema) => {

        var inputTableConfig = new Forms.InputTableConfig();
        inputTableConfig.data = hostConfigurationSchema;
        inputTableConfig.json = $scope.requirements.sshConfiguration.hosts;

        Core.pathSet(sshConfigurationSchema, ['properties', 'hosts', 'inputTable'], inputTableConfig);

        sshConfigurationSchema['tabs'] = {
          'Hosts': ['hosts'],
          'Defaults': ['defaultUsername', 'defaultPassword', 'defaultPort', 'defaultPrivateKeyFile', 'defaultPassPhrase', 'defaultPath', '*']
        };
        log.debug("Schema: ", sshConfigurationSchema);
        $scope.formConfig = sshConfigurationSchema;
        Core.$apply($scope);
      });
    });
  }]);
}
