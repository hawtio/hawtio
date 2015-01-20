/// <reference path="infinispanPlugin.ts"/>
module Infinispan {

  _module.controller("Infinispan.QueryController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {
    var interpreter = new CLI(workspace, jolokia);
    $scope.logs = [];
    $scope.filteredLogs = [];
    $scope.selectedItems = [];
    $scope.searchText = "";
    $scope.filter = {
      // The default logging level to show, empty string => show all
      logLevelQuery: "",
      // The default value of the exact match logging filter
      logLevelExactMatch: false
    };

    var columnDefs:any[] = [
      {
        field: 'key',
        displayName: 'Key'
      },
      {
        field: 'value',
        displayName: 'Value'
      }
    ];


    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'filteredLogs',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: "searchText"
      },
      columnDefs: columnDefs,
      rowDetailTemplateId: "logDetailTemplate"
      //rowTemplate: '<div ng-style="{\'cursor\': row.cursor}" ng-repeat="col in visibleColumns()" class="{{logClass(row.entity)}} ngCell col{{$index}} {{col.cellClass}}" ng-cell></div>'
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(refreshCacheName, 50);
    });

    $scope.$watch('workspace.selection', function () {
      refreshCacheName();
    });


    $scope.doQuery = () => {
      if ($scope.sql) {
        interpreter.execute($scope.sql, handleResults);
      }
    };

    function handleResults(results) {
      $scope.output = null;
      if (!results) {
        console.log("no output...");
      } else {
        var error = results["ERROR"] || "";
        var stackTrace = results["STACKTRACE"] || "";
        if (error || stackTrace) {
          if (stackTrace) {
            error += "\n" + stackTrace;
          }
          Core.notification("error", error);
        } else {
          var output = results["OUTPUT"];
          if (!output) {
            Core.notification("error", "No results!");
          } else {
            $scope.output = output;
            console.log("==== output: " + output);
            Core.$apply($scope);
          }
        }
      }
    }

    function refreshCacheName() {
      var cacheName = Infinispan.getSelectedCacheName(workspace);
      console.log("selected cacheName is: " + cacheName);
      if (cacheName) {
        interpreter.setCacheName(cacheName);
      }
    }
  }]);
}
