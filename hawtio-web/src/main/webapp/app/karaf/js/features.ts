module Karaf {

  export function FeaturesController($scope, $location, workspace, jolokia) {

    $scope.feature = empty();

    var key = $location.search()['repo'];
    if (key) {
      $scope.repository = { id: key };
    }

    // caches last jolokia result
    $scope.result = [];

    // rows in feature table
    $scope.features = [];
    $scope.repositories = [];

    // selected features
    $scope.selectedFeatures = [];


    /*
     var SearchProvider = function (scope, location) {
     var self = this;
     self.scope = scope;
     self.location = location;

     self.callback = function (newValue, oldValue) {
     if (angular.isUndefined(oldValue) && angular.isUndefined(newValue)) {
     // if for some reason we do not have a values
     return
     }

     // if we have an old value to quick compare against
     if (angular.isDefined(oldValue)) {
     if (newValue === oldValue) {
     return;
     }
     if (newValue.id === oldValue.id) {
     return;
     }
     }
     self.scope.features = featuresOfRepo(self.scope.repository.id, self.scope.features);
     self.scope.feature = setSelect(self.scope.repository, self.scope.repositories);

     var q = location.search();
     q['repo'] = self.scope.repository.id;
     location.search(q);
     self.evalFilter();
     };

     self.scope.$watch('repository', self.callback);

     self.init = function (childScope, grid) {
     self.grid = grid;
     self.childScope = childScope;
     grid.searchProvider = self;
     };

     self.evalFilter = function () {
     var byRepo = self.grid.sortedData;
     if (angular.isDefined(self.scope.repository)) {
     if (self.scope.repository.id !== "") {
     byRepo = self.grid.sortedData.findAll(function (item) {
     return item.Repository === self.scope.repository.id
     });
     }
     }
     self.grid.filteredData = byRepo;
     self.grid.rowFactory.filteredDataChanged();
     };

     }

     var searchProvider = new SearchProvider($scope, $location);
     */

    $scope.featureOptions = {
      //plugins: [searchProvider],
      data: 'features',
      showFilter: false,
      showColumnMenu: false,
      filterOptions: {
        useExternalFilter: true
      },
      selectedItems: $scope.selectedFeatures,
      rowHeight: 32,
      selectWithCheckboxOnly: true,
      columnDefs: [
        {
          field: 'Name',
          displayName: 'Name',
          cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
          width: 200
        },
        {
          field: 'Version',
          displayName: 'Version',
          cellTemplate: '<div class="ngCellText"><a href="#/karaf/feature/{{row.entity.Name}}/{{row.entity.Version}}">{{row.getProperty(col.field)}}</a></div>',
          width: 200
        }
      ]
    };

    var featuresMBean = Karaf.getSelectionFeaturesMBean(workspace);
    if (featuresMBean) {
      Core.register(jolokia, $scope, {
        type: 'read', mbean: featuresMBean
      }, onSuccess(render));
    }

    $scope.install = () => {
      $scope.selectedFeatures.forEach(function (feature) {
        installFeature(workspace, jolokia, feature.name, feature.version, function () {
          console.log("Installed!")
        }, function () {
          console.log("Failed to install!")
        });
      });
    };

    $scope.uninstall = () => {
      $scope.selectedFeatures.forEach(function (feature) {
        uninstallFeature(workspace, jolokia, feature.name, feature.version, function () {
          console.log("Uninstalled!")
        }, function () {
          console.log("Failed to uninstall!")
        });
      });
    };

    $scope.statusIcon = (row) => {
      if (row) {
        if (row.alive) {
          switch (row.provisionResult) {
            case 'success':
              return "icon-thumbs-up";
            case 'downloading':
              return "icon-download-alt";
            case 'installing':
              return "icon-hdd";
            case 'analyzing':
            case 'finalizing':
              return "icon-refresh icon-spin";
            case 'resolving':
              return "icon-sitemap";
            case 'error':
              return "red icon-warning-sign";
          }
        } else {
          return "icon-off";
        }
      }
      return "icon-refresh icon-spin";
    };


    function empty() {
      return [
        {id: ""}
      ];
    }

    function render(response) {
      if (!Object.equal($scope.result, response.value)) {
        $scope.result = response.value;

        $scope.features = [];
        $scope.repositories = empty();

        populateFeaturesAndRepos($scope.result, $scope.features, $scope.repositories);
        $scope.repository = setSelect($scope.repository, $scope.repositories);
        $scope.$apply();
      }
    }

    function featuresOfRepo(repository, features) {
      if (repository === "") {
        return features;
      }
      return features.findAll(function (feature) {
        return feature.repository === repository
      });
    }
  }
}
