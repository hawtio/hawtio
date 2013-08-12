module Fabric {

  export function CreateContainerController($scope, $element, $compile, $location, workspace, jolokia, localStorage) {

    $scope.versionsOp = 'versions()';

    $scope.providers = Fabric.registeredProviders(jolokia);
    $scope.selectedProvider = $scope.providers[Object.extended($scope.providers).keys().first()];
    $scope.schema = {};

    $scope.entity = {
      number: 1
    };

    $scope.$watch('selectedProvider', (newValue, oldValue) => {
      if (newValue) {
        console.log("Selected provider: ", $scope.selectedProvider);
        Fabric.getSchema($scope.selectedProvider.id, $scope.selectedProvider.className, jolokia, (schema) => {
          $scope.schema = schema;
          Core.$apply($scope);
        });
      }

    }, true);

    $scope.$watch('schema', (newValue, oldValue) => {
      if (newValue !== oldValue) {

        $scope.entity['providerType'] = $scope.selectedProvider.id;
        $location.search('tab', $scope.selectedProvider.id);

        switch($scope.selectedProvider.id) {

          case 'child':
            $scope.entity['jmxUser'] = localStorage['fabric.userName'];
            $scope.entity['jmxPassword'] = localStorage['fabric.password'];
            break;

          case 'ssh':
            break;

          case 'jcloud':
            break;
        }
      }
    }, true);

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
      $scope.selectedProvider = $scope.providers[tab];

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

  }

}
