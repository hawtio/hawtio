module Fabric {

  export function CreateContainerController($scope, $window, $location, workspace, jolokia, localStorage) {


    $scope.versionsOp = 'versions()';

    $scope.activeTab = 'org_fusesource_fabric_api_CreateContainerChildOptions';

    $scope.schema = {};
    $scope.entity = {};
    $scope.versions = [];
    $scope.selectedVersion = {};
    $scope.selectedProfiles = [];
    $scope.selectedVersionId = '';

    $scope.response = {};

    $scope.init = () => {

      var tab = $location.search()['tab'];
      if (tab) {
        switch(tab) {
          case 'child':
            $scope.activeTab = 'org_fusesource_fabric_api_CreateContainerChildOptions';
            break;
          case 'ssh':
            $scope.activeTab = 'org_fusesource_fabric_api_CreateSshContainerOptions';
            break;
          case 'cloud':
            $scope.activeTab = 'org_fusesource_fabric_api_CreateJCloudsContainerOptions';
            break;
          default:
            $scope.activeTab = 'org_fusesource_fabric_api_CreateContainerChildOptions';
        }
      }

      var parentId = $location.search()['parentId'];
      if (parentId) {
        $scope.entity['parent'] = parentId;
      }

      var versionId = $location.search()['versionId'];
      if (versionId) {
        $scope.selectedVersionId = versionId;
      }

    }

    $scope.init();

    $scope.$on('$routeUpdate', $scope.init);

    $scope.$watch('selectedVersion', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedVersionId = $scope.selectedVersion.id;
        $location.search('versionId', $scope.selectedVersionId);
      }
    });

    $scope.render = (response) => {
      if (!Object.equal($scope.response, response.value)) {
        $scope.response = response.value;
        $scope.versions = Object.clone($scope.response);
        if (Object.equal($scope.selectedVersion, {})) {
          if ($scope.selectedVersionId !== '') {
            $scope.selectedVersion = $scope.versions.find((v) => { return v.defaultVersion === true; });
          } else {
            $scope.selectedVersion = $scope.versions.find((v) => { return v.id === $scope.selectedVersionId; });
          }
        }
        $scope.$apply();
      }
    }

    $scope.renderForm = () => {

        $scope.schema = Object.extended($window[$scope.activeTab]).clone();
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

        $scope.schema.properties['providerType']['type'] = 'hidden';

        switch($scope.activeTab) {

          case 'org_fusesource_fabric_api_CreateContainerChildOptions':
            $scope.entity['providerType'] = 'child';
            $scope.entity['jmxUser'] = localStorage['fabric.userName'];
            $scope.entity['jmxPassword'] = localStorage['fabric.password'];
            $scope.schema.properties['jmxPassword']['type'] = 'password';

            $scope.schema.properties['saveJmxCredentials'] = {
              'type': 'boolean'
            };

            delete $scope.schema.properties['preferredAddress'];
            delete $scope.schema.properties['resolver'];
            delete $scope.schema.properties['ensembleServer'];
            delete $scope.schema.properties['proxyUri'];
            delete $scope.schema.properties['adminAccess'];
            $location.search('tab', 'child');

            break;

          case 'org_fusesource_fabric_api_CreateSshContainerOptions':
            $scope.entity['providerType'] = 'ssh';
            delete $scope.schema.properties['parent'];
            $location.search('tab', 'ssh');
            break;

          case 'org_fusesource_fabric_api_CreateJCloudsContainerOptions':
            $scope.entity['providerType'] = 'jclouds';
            delete $scope.schema.properties['parent'];
            $location.search('tab', 'cloud');
            break;
        }
    }

    $scope.onSubmit = (json, form) => {

      if ($scope.entity.saveJmxCredentials) {
        localStorage['fabric.userName'] = $scope.entity.jmxUser;
        localStorage['fabric.password'] = $scope.entity.jmxPassword;
      }

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
          }
        },
        error: (response) => {
          notification('error', "Error creating containers: " + response.error);
        }
      });

      notification('info', "Requesting that new container(s) be created");
      $location.path('/fabric/view');
    }

    $scope.$watch('activeTab', $scope.renderForm);

    Core.register(jolokia, $scope, [
      {type: 'exec', mbean: managerMBean, operation: $scope.versionsOp }
    ], onSuccess($scope.render));

  }

}
