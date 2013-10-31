module Karaf {

  export function FeaturesController($scope, $location, workspace, jolokia, $parse) {

    $scope.feature = empty();
    $scope.installedOnly = true;
    $scope.hasFabric = Fabric.hasFabric(workspace);

    var key = $location.search()['repo'];
    if (key) {
      $scope.repository = { id: key };
    }
    /*
    //TODO to add this we should disable page refreshing when $location is updated
    var installed = $location.search()['installedOnly'];
    if (installed) {
      $parse(installed)($scope);
    }
    */

    // caches last jolokia result
    $scope.result = [];

    // rows in feature table
    $scope.features = [];
    $scope.repositories = [];

    // selected features
    $scope.selectedFeatures = [];


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

      self.scope.$watch('installedOnly', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          self.evalFilter();
        }
      });

      self.scope.$watch('filter', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          self.evalFilter();
        }
      });

      self.init = function (childScope, grid) {
        self.grid = grid;
        self.childScope = childScope;
        grid.searchProvider = self;
      };

      self.evalFilter = function () {
        var byRepo = self.grid.rowCache;
        if (angular.isDefined(self.scope.repository)) {
          if (self.scope.repository.id !== "") {
            byRepo = self.grid.rowCache.findAll((item) => {
              return item.entity.RepositoryName === self.scope.repository.id;
            });
          }
        }
        if (self.scope.installedOnly) {
          byRepo = byRepo.findAll((item) => {
            return item.entity.Installed;
          });
        }
        if (self.scope.filter) {
          byRepo = byRepo.findAll((item) => {
            return item.entity.Name.has(self.scope.filter) || item.entity.Version.has(self.scope.filter) || item.entity.RepositoryName.has(self.scope.filter);
          });
        }
        self.grid.filteredRows = byRepo;
        self.grid.rowFactory.filteredRowsChanged();
      };

    }

    var searchProvider = new SearchProvider($scope, $location);

    $scope.featureOptions = {
      plugins: [searchProvider],
      data: 'features',
      showFilter: false,
      showColumnMenu: false,
      filterOptions: {
        useExternalFilter: true
      },
      selectedItems: $scope.selectedFeatures,
      rowHeight: 32,
      enableRowSelection: !$scope.hasFabric,
      selectWithCheckboxOnly: true,
      keepLastSelected: true,
      showSelectionCheckbox: !$scope.hasFabric,
      columnDefs: [
        {
          field: 'Name',
          displayName: 'Feature Name',
          cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field)}}</div>',
          width: 200
        },
        {
          field: 'Version',
          displayName: 'Version',
          cellTemplate: '<div class="ngCellText"><a href="#/osgi/feature/{{row.entity.Name}}/{{row.entity.Version}}?p=container">{{row.getProperty(col.field)}}</a></div>',
          width: 200
        },
        {
          field: 'RepositoryName',
          displayName: 'Repository'
        },
        {
          field: 'Installed',
          displayName: 'Installed'
        }
      ],
      sortInfo: {
        fields: ['Installed', 'RepositoryName'],
        directions: ['asc', 'asc']
      }
    };

    var featuresMBean = Karaf.getSelectionFeaturesMBean(workspace);
    if (featuresMBean) {
      Core.register(jolokia, $scope, {
        type: 'read', mbean: featuresMBean
      }, onSuccess(render));
    }

    $scope.install = () => {
      $scope.selectedFeatures.each((feature) => {

        var feature = feature;
        installFeature(workspace, jolokia, feature.Name, feature.Version, () => {
          notification('success', 'Installed feature ' + feature.Name);
          Core.$apply($scope);
        }, (response) => {
          notification('error', 'Failed to install feature ' + feature.Name + ' due to ' + response.error);
          Core.$apply($scope);
        });
      });
    };

    $scope.uninstall = () => {
      $scope.selectedFeatures.each((feature) => {

        var feature = feature;
        uninstallFeature(workspace, jolokia, feature.Name, feature.Version, () => {
          notification('success', 'Uninstalled feature ' + feature.Name);
          Core.$apply($scope);
        }, (response) => {
          notification('error', 'Failed to uninstall feature ' + feature.Name + ' due to ' + response.error);
          Core.$apply($scope);
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

    $scope.javascript = 'javascript';

    function render(response) {
      if (!Object.equal($scope.result, response.value)) {
        $scope.result = response.value;
        //$scope.resultString = angular.toJson($scope.result, true);

        $scope.features = [];
        $scope.repositories = empty();

        populateFeaturesAndRepos($scope.result, $scope.features, $scope.repositories);
        $scope.repository = setSelect($scope.repository, $scope.repositories);

        //$scope.featuresString = angular.toJson($scope.features, true);
        //$scope.repositoriesString = angular.toJson($scope.repositories, true);

        Core.$apply($scope);
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
