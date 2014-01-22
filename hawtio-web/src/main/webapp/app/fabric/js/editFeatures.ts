module Fabric {

  export function FeatureEditController($scope, $routeParams, $location, jolokia, xml2json) {

    $scope.getProfileFeaturesOp = "getProfileFeatures(java.lang.String, java.lang.String)";
    $scope.versionId = $routeParams.versionId;
    $scope.profileId = $routeParams.profileId;

    $scope.response = {};

    $scope.features = [];

    $scope.selectedRepoFeatures = [];

    $scope.deletingFeatures = [];
    $scope.addingFeatures = [];

    $scope.selectedRepoSelectedFeatures = [];

    $scope.featureGridOptions = {
      data: 'selectedRepoFeatures',
      selectedItems: $scope.selectedRepoSelectedFeatures,
      displayFooter: false,
      showFilter: false,
      keepLastSelected: true,
      showSelectionCheckbox: true,
      filterOptions: {
        filterText: ''
      },
      columnDefs: [
        {
          field: 'name',
          displayName: 'Name'
        },
        {
          field: 'version',
          displayName: 'Version'
        }
      ]
    }


    $scope.$watch('features', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.parentFeatures = $scope.features.filter((f) => { return f.isParentFeature });
        $scope.profileFeatures = $scope.features.filter((f) => { return !f.isParentFeature });
        $scope.addingFeatures = $scope.features.filter((f) => { return f.adding; });
        $scope.deletingFeatures = $scope.features.filter((f) => { return f.deleting; });
      }
    }, true);

    $scope.$watch('addingFeatures', (newValue, oldValue) => {
      if (newValue !== oldValue) {

      }
    }, true);


    $scope.dispatch = (response) => {
      var responseJson = angular.toJson(response.value);
      if (responseJson !== $scope.responseJson) {
        if (angular.isDefined($scope.responseJson)) {
          notification('info', "Profile feature definitions updated");
        }
        $scope.responseJson = responseJson;
        $scope.features = response.value.featureDefinitions;
        var repositories = response.value.repositoryDefinitions;

        $scope.selectedRepoFeatures = [];

        repositories.forEach((repo) => {
          var repoJson = xml2json(repo['data']);
          if ('feature' in repoJson) {
            var features = repoJson['feature'];
            if (!angular.isArray(features)) {
              features = [features];
            }
            $scope.selectedRepoFeatures.add(features);
          }
        });

        $scope.selectedRepoFeatures = $scope.selectedRepoFeatures.sortBy('name');

        Core.$apply($scope);
      }
    };


    $scope.getClass = (feature) => {
      if (feature.adding) {
        return "adding";
      }
      if (feature.deleting) {
        return "deleting";
      }
      return "";
    };


    $scope.removeFeature = (feature) => {
      if (feature.adding) {
        $scope.features.remove((f) => { return f.id === feature.id });
      } else {
        feature.deleting = !feature.deleting;
      }
    };


    $scope.addSelectedFeatures = (withVersion) => {

      $scope.selectedRepoSelectedFeatures.each((feature) => {

        var id = feature.name;

        if (withVersion) {
          id = id + "/" + feature.version;
        }

        $scope.features.push({
          id: id,
          adding: true
        });

      });

    };


    $scope.save = () => {
      jolokia.request({
        type: 'exec', mbean: managerMBean,
        operation: 'getConfigurationFile(java.lang.String, java.lang.String, java.lang.String)',
        arguments: [$scope.versionId, $scope.profileId, 'io.fabric8.agent.properties']
      }, onSuccess($scope.doSave));
    };


    $scope.doSave = (response) => {
      var configFile = response.value.decodeBase64();
      var lines = configFile.lines();

      if ($scope.deletingFeatures.length > 0) {
        $scope.deletingFeatures.each((feature) => {
          lines.remove((line) => {
            return line.startsWith("feature." + feature.id);
          });
        });
      }

      if ($scope.addingFeatures.length > 0) {
        $scope.addingFeatures.each((feature) => {
          lines.add("feature." + feature.id + " = " + feature.id);
        });
      }

      configFile = lines.join('\n');

      saveConfigFile(jolokia, $scope.versionId, $scope.profileId, 'io.fabric8.agent.properties', configFile.encodeBase64(), () => {
          notification('success', "Updated feature definitions...");
          Core.$apply($scope);
        }, (response) => {
          notification('error', "Failed to save feature definitions due to " + response.error);
          Core.$apply($scope);
        });
    };


    Core.register(jolokia, $scope, [{
      type: 'exec', mbean: managerMBean, operation: $scope.getProfileFeaturesOp,
        arguments: [$scope.versionId, $scope.profileId]
      }], onSuccess($scope.dispatch));


  }


}
