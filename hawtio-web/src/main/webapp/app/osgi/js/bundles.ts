module Osgi {

  export function BundlesController($scope, workspace:Workspace, jolokia) {

    $scope.result = {};
    $scope.bundles = [];
    $scope.selectedBundles = [];
    $scope.loading = true;

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
        cellTemplate: '<div class="ngCellText"><a href="#/osgi/bundle/{{row.entity.Identifier}}">{{row.getProperty(col.field)}}</a></div>'
      },
      {
        field: 'SymbolicName',
        displayName: 'SymbolicName',
        width: "***",
        cellTemplate: '<div class="ngCellText"><a href="#/osgi/bundle/{{row.entity.Identifier}}">{{row.getProperty(col.field)}}</a></div>'
      },
      {
        field: 'Version',
        displayName: 'Version',
        width: "**"
      },
      {
        field: 'LastModified',
        displayName: 'Last Modified',
        cellFilter: "date:'yyyy-MM-dd HH:mm:ss'",
        width: "**"
      },
      {
        field: 'Location',
        displayName: 'Update Location',
        width: "***"
      }
    ];

    $scope.gridOptions = {
      data: 'bundles',
      showfilter: false,
      selectedItems: $scope.selectedBundles,
      selectWithCheckboxOnly: true,
      columnDefs: columnDefs
    };

    function render(response) {
      if (!Object.equal($scope.result, response.value)) {
        console.log("Got: ", response.value);
        console.log("First: ", response.value[1]);
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
        $scope.$apply();
      }
    }

    Core.register(jolokia, $scope, {
      type: 'exec', mbean: getSelectionBundleMBean(workspace),
      operation: 'listBundles()'
    }, onSuccess(render));

  }
}
