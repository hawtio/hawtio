module Fabric {

  export function CreateContainerController($scope, $element, $compile, $location, workspace, jolokia, localStorage) {

    $scope.versionsOp = 'versions()';

    $scope.entity = {
      number: 1
    };

    // the form properties stored in local storage
    // which we then default when creating a new container
    var localStorageProperties = {
      child: {
        jmxUser: 'fabric.userName',
        jmxPassword: 'fabric.password'
      },
      openshift: {
        serverUrl: 'openshift.serverUrl',
        login: 'openshift.login',
        password: 'openshift.password',
        domain: 'openshift.domain',
        gearProfile: 'openshift.gearProfile'
      },
      jclouds: {
        owner: 'jclouds.owner',
        credential: 'jclouds.credential',
        providerName: 'jclouds.providerName',
        imageId: 'jclouds.imageId',
        hardwareId: 'jclouds.hardwareId',
        locationId: 'jclouds.locationId',
        group: 'jclouds.group',
        instanceType: 'jclouds.instanceType'
      }
    };

    $scope.providers = Fabric.registeredProviders(jolokia);
    console.log("providers: ", $scope.providers);
    $scope.selectedProvider = $scope.providers[Object.extended($scope.providers).keys().first()];
    $scope.schema = {};

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

    $scope.$watch('selectedProvider', (newValue, oldValue) => {
      if ($scope.selectedProvider) {
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

        var providerId = $scope.entity['providerType'];
        var properties = localStorageProperties[providerId];

        // e.g. key = jmxUser, value = fabric.userName
        //
        //    $scope.entity['jmxUser'] = localStorage['fabric.userName'];
        //    $scope.entity['jmxPassword'] = localStorage['fabric.password'];

        angular.forEach(properties, (value, key) => {
          var localValue = localStorage[value];
          if (localValue) {
            $scope.entity[key] = localValue;
          }
        });

        Forms.defaultValues($scope.entity, $scope.schema);
      }
    }, true);


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
      var profileIds = $scope.selectedProfileIds.split(',');
      var selected = [];
      profileIds.each((id) => {
        selected.push({
          id: id,
          selected: true
        });
      });
      $scope.selectedProfiles = selected;
      $location.search('profileIds', $scope.selectedProfileIds);
    });


    $scope.init = () => {

      var tab = $location.search()['tab'];
      if (tab) {
        $scope.selectedProvider = $scope.providers[tab];
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

    };

    $scope.init();


    $scope.$on('$routeUpdate', $scope.init);


    $scope.onSubmit = (json, form) => {

      var providerId = $scope.entity['providerType'];
      if (json.saveJmxCredentials || 'child' !== providerId) {
        // e.g. key = jmxUser, value = fabric.userName
        //    localStorage['fabric.userName'] = $scope.entity.jmxUser;
        //    localStorage['fabric.password'] = $scope.entity.jmxPassword;
        var properties = localStorageProperties[providerId];

        angular.forEach(properties, (value, key) => {
          var entityValue = $scope.entity[key];
          if (entityValue) {
            localStorage[value] = entityValue;
          }
        });

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
      $location.url('/fabric/containers');
    }

  }

}
