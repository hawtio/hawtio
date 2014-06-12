/// <reference path="fabricPlugin.ts"/>
module Fabric {

  _module.controller("Fabric.CreateFabricController", ["$scope", "jolokia", "$location", "workspace", "branding", ($scope, jolokia, $location, workspace:Workspace, branding) => {

    $scope.$on('$routeChangeSuccess', () => {
      if (workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "Fabric"})) {
        $location.url("/fabric/view");
      }
    });

    Fabric.getSchema('createEnsemble', 'io.fabric8.api.CreateEnsembleOptions', jolokia, (schema) => {
      $scope.schema = schema;
      Core.$apply($scope);
    });

    $scope.creating = false;

    $scope.entity = {
      zooKeeperServerPort: 2181,
      globalResolver: 'localhostname',
      resolver: 'localhostname',
      agentEnabled: true,
      autoImportEnabled: true,
      minimumPort: 0,
      maximumPort: 65535,
      profiles: ['fabric', 'hawtio']
    };

    if (branding.profile) {
      $scope.entity.profiles.push(branding.profile);
    }

    // console.log("entity: ", $scope.entity);

    $scope.forms = {};

    $scope.onSubmit = (json, form) => {

      json = Fabric.sanitizeJson(json);

      setTimeout(() => {

        jolokia.execute(Fabric.clusterBootstrapManagerMBean, 'createCluster(java.util.Map)', angular.toJson(json), {
          method: 'post',
          success: (response) => {
            notification('success', "Created fabric!");
            $location.url("/fabric/containers");
            Core.$apply($scope);
          },
          error: (response) => {
            notification('error', "Error creating fabric: " + response.error);
            Core.$apply($scope);
          }
        });
        notification('info', "Creating fabric, please wait...");
        $location.url("/openlogs");
        Core.$apply($scope);
      }, 30);

    }

  }]);

}
