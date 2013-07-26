module Fabric {

  export function CreateContainerController($scope, $window, $location, workspace, jolokia, localStorage) {

    Fabric.schemaConfigure();

    $scope.versionsOp = 'versions()';

    $scope.activeTab = 'org_fusesource_fabric_api_CreateChildContainerOptions';

    $scope.schema = {};
    $scope.entity = {};
    $scope.response = {};

    $scope.versions = [];
    $scope.profiles = [];

    $scope.selectedVersion = {};

    $scope.selectedProfiles = [];
    $scope.selectedProfileIds = '';
    $scope.selectedVersionId = '';
    $scope.profileIdFilter = '';

    // holds all the form objects from nested child scopes
    $scope.forms = {};

    $scope.showAddProfileDialog = false;

    $scope.init = () => {

      var tab = $location.search()['tab'];
      if (tab) {
        switch(tab) {
          case 'child':
            $scope.activeTab = 'org_fusesource_fabric_api_CreateChildContainerOptions';
            break;
          case 'ssh':
            $scope.activeTab = 'org_fusesource_fabric_api_CreateSshContainerOptions';
            break;
          case 'cloud':
            $scope.activeTab = 'org_fusesource_fabric_api_CreateJCloudsContainerOptions';
            break;
          default:
            $scope.activeTab = 'org_fusesource_fabric_api_CreateChildContainerOptions';
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

      var profileIds = $location.search()['profileIds'];
      if (profileIds) {
        $scope.selectedProfileIds = profileIds;
      }

    }

    $scope.init();


    $scope.$on('$routeUpdate', $scope.init);

    $scope.$watch('versions', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (!$scope.selectedVersion) {
          if ($scope.selectedVersionId !== '') {
            $scope.selectedVersion = $scope.versions.find((v) => { return v.id === $scope.selectedVersionId });
          } else {
            $scope.selectedVersion = $scope.versions.find((v) => {return v.defaultVersion });
          }
        }
      }
    });


    $scope.$watch('selectedVersion', (newValue, oldValue) => {
      if (oldValue !== newValue) {
        $scope.selectedVersionId = $scope.selectedVersion.id;
        $location.search('versionId', $scope.selectedVersionId);
      }
    }, true);


    $scope.$watch('selectedProfiles', (newValue, oldValue) => {
      if (oldValue !== newValue) {
        $scope.selectedProfileIds = $scope.selectedProfiles.map((p) => { return p.id; }).join(',');
      }
    }, true);


    $scope.$watch('selectedProfileIds', (newValue, oldValue) => {
      $location.search('profileIds', $scope.selectedProfileIds);
    });


    $scope.renderForm = () => {

        $scope.schema = Object.extended($window[$scope.activeTab]).clone();
        $scope.schema.description = '';
        
        angular.forEach($scope.schema.properties, (value, key) => {
          if (!value) {
            delete $scope.schema.properties[key];
          }
        });

        $scope.entity['number'] = 1;

        // clean up form
        delete $scope.schema.properties['metadataMap'];
        delete $scope.schema.properties['zookeeperUrl'];
        delete $scope.schema.properties['zookeeperPassword'];
        delete $scope.schema.properties['globalResolver'];
        delete $scope.schema.properties['zooKeeperServerPort'];
        delete $scope.schema.properties['agentEnabled'];
        delete $scope.schema.properties['autoImportEnabled'];
        delete $scope.schema.properties['importPath'];
        delete $scope.schema.properties['users'];


        $scope.schema.properties['providerType']['type'] = 'hidden';
        $scope.schema.properties['profiles']['type'] = 'hidden';
        $scope.schema.properties['version']['type'] = 'hidden';

        switch($scope.activeTab) {

          case 'org_fusesource_fabric_api_CreateChildContainerOptions':
            $scope.entity['providerType'] = 'child';
            $scope.entity['jmxUser'] = localStorage['fabric.userName'];
            $scope.entity['jmxPassword'] = localStorage['fabric.password'];
            $scope.schema.properties['jmxPassword']['type'] = 'password';

            $scope.schema.properties['saveJmxCredentials'] = {
              'type': 'boolean'
            };

            delete $scope.schema.properties['manualIp'];
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

      if (json.saveJmxCredentials) {
        localStorage['fabric.userName'] = $scope.entity.jmxUser;
        localStorage['fabric.password'] = $scope.entity.jmxPassword;
      }

      delete json.saveJmxCredentials;

      if ( json.number === 1 ) {
        delete json.number;
      }

      json['version'] = $scope.selectedVersion.id;
      if ($scope.selectedProfiles.length > 0) {
        json['profiles'] = $scope.selectedProfiles.map((p) => { return p.id; });
      }

      jolokia.execute(managerMBean, 'createContainers(java.util.Map)', angular.toJson(json), {
        method: "post",
        success: (response) => {
          var error = false;
          angular.forEach(response.value, function(value, key) {
            error = true;
            notification('error', "Creating container " + key + " failed: " + value);
          });
          if (!error) {
            notification('success', "Successfully created containers");
          }
          Core.$apply($scope);
        },
        error: (response) => {
          notification('error', "Error creating containers: " + response.error);
          Core.$apply($scope);
        }
      });

      notification('info', "Requesting that new container(s) be created");
      $location.url('/fabric/view');
    }

    $scope.$watch('activeTab', $scope.renderForm);

  }

}
