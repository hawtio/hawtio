module Osgi {

  export function BundlesController($scope, workspace:Workspace, jolokia) {

    $scope.result = {};
    $scope.bundles = [];
    $scope.selected = [];
    $scope.loading = true;
    $scope.bundleUrl = "";

    $scope.installDisabled = function() {
      return $scope.bundleUrl === "";
    }

    var columnDefs = [
      {
        field: 'Identifier',
        displayName: 'Identifier',
        width: "48",
        headerCellTemplate: '<div ng-click="col.sort()" class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }"><div class="ngHeaderText colt{{$index}} pagination-centered" title="Identifier"><i class="icon-tag"></i></div><div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div><div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div></div>',
      },
      {
        field: 'State',
        displayName: 'Bundle State',
        width: "24",
        headerCellTemplate: '<div ng-click="col.sort()" class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }"><div class="ngHeaderText colt{{$index}} pagination-centered" title="State"><i class="icon-tasks"></i></div><div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div><div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div></div>',
        cellTemplate: '<div class="ngCellText" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field)}}"></i></div>'
      },
      {
        field: 'Name',
        displayName: 'Name',
        width: "***",
        cellTemplate: '<div class="ngCellText"><a href="#/osgi/bundle/{{row.entity.Identifier}}?p=container">{{row.getProperty(col.field)}}</a></div>'
      },
      {
        field: 'SymbolicName',
        displayName: 'Symbolic Name',
        width: "***",
        cellTemplate: '<div class="ngCellText"><a href="#/osgi/bundle/{{row.entity.Identifier}}?p=container">{{row.getProperty(col.field)}}</a></div>'
      },
      {
        field: 'Version',
        displayName: 'Version',
        width: "**"
      },/*
      {
        field: 'LastModified',
        displayName: 'Last Modified',
        cellFilter: "date:'yyyy-MM-dd HH:mm:ss'",
        width: "**"
      },  */
      {
        field: 'Location',
        displayName: 'Update Location',
        width: "***"
      }
    ];

    $scope.gridOptions = {
      data: 'bundles',
      showFilter: false,
      selectedItems: $scope.selected,
      selectWithCheckboxOnly: true,
      columnDefs: columnDefs,
      filterOptions: {
        filterText: ''
      }
    };

    $scope.onResponse = function () {
      jolokia.request({
            type: 'exec',
            mbean: getSelectionBundleMBean(workspace),
            operation: 'listBundles()'
          },
          {
            success: render,
            error: render
          });
    }

    $scope.controlBundles = function(op) {
      var startBundle = function(response) {

      }
      var ids = $scope.selected.map(function(b) { return b.Identifier });
      if (!angular.isArray(ids)) {
        ids = [ids];
      }
      jolokia.request({
        type: 'exec',
        mbean: getSelectionFrameworkMBean(workspace),
        operation: op,
        arguments: [ids]
      },
      {
        success: $scope.onResponse,
        error: $scope.onResponse
      });
    }

    $scope.stop = function() {
      $scope.controlBundles('stopBundles([J)');
    }

    $scope.start = function() {
      $scope.controlBundles('startBundles([J)');
    }

    $scope.update = function() {
      $scope.controlBundles('updateBundles([J)');
    }

    $scope.refresh = function() {
      $scope.controlBundles('refreshBundles([J)');
    }

    $scope.uninstall = function() {
      $scope.controlBundles('uninstallBundles([J)');
    }

    $scope.install = function() {
      jolokia.request({
        type: 'exec',
        mbean: getSelectionFrameworkMBean(workspace),
        operation: "installBundle(java.lang.String)",
        arguments: [$scope.bundleUrl]
      },
      {
        success: function(response) {
          console.log("Got: ", response);
          $scope.bundleUrl = ""
          jolokia.request({
                type: 'exec',
                mbean: getSelectionFrameworkMBean(workspace),
                operation: "startBundle(long)",
                arguments: [response.value]
              },
              {
                success: $scope.onResponse,
                error: $scope.onResponse
              });
        },
        error: function(response) {
          $scope.bundleUrl = ""
          $scope.onResponse();
        }
      });
    }

    function render(response) {
      if (!Object.equal($scope.result, response.value)) {
        $scope.selected.length = 0;
        $scope.result = response.value;
        $scope.bundles = [];
        angular.forEach($scope.result, function(value, key) {
          var obj = {
            Identifier: value.Identifier,
            Name: "",
            SymbolicName: value.SymbolicName,
            State: value.State,
            Version: value.Version,
            LastModified: value.LastModified,
            Location: value.Location
          };
          if (value.Headers['Bundle-Name']) {
            obj.Name = value.Headers['Bundle-Name']['Value'];
          }
          $scope.bundles.push(obj);
        });
        $scope.loading = false;
        Core.$apply($scope);
      }
    }

    Core.register(jolokia, $scope, {
      type: 'exec', mbean: getSelectionBundleMBean(workspace),
      operation: 'listBundles()'
    }, onSuccess(render));

  }
}
