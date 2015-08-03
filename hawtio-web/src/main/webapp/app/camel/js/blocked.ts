/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.BlockedExchangesController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {

    $scope.data = [];
    $scope.initDone = false;

    $scope.mbeanAttributes = {};

    var columnDefs:any[] = [
      {
        field: 'exchangeId',
        displayName: 'Exchange Id',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'routeId',
        displayName: 'Route Id',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'nodeId',
        displayName: 'Node Id',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'duration',
        displayName: 'Duration (ms)',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'id',
        displayName: 'Thread id',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'name',
        displayName: 'Thread name',
        cellFilter: null,
        width: "*",
        resizable: true
      }
    ];

    $scope.gridOptions = {
      data: 'data',
      displayFooter: true,
      displaySelectionCheckbox: false,
      canSelectRows: false,
      enableSorting: true,
      columnDefs: columnDefs,
      selectedItems: [],
      filterOptions: {
        filterText: ''
      }
    };

    function onBlocked(response) {
      var obj = response.value;
      if (obj) {

        // the JMX tabular data has 1 index so we need to dive 1 levels down to grab the data
        var arr = [];
        for (var key in obj) {
          var entry = obj[key];
          arr.push(
            {
              exchangeId: entry.exchangeId,
              routeId: entry.routeId,
              nodeId: entry.nodeId,
              duration: entry.duration,
              id: entry.id,
              name: entry.name
            }
          );
        }

        arr = arr.sortBy("exchangeId");
        $scope.data = arr;

        // okay we have the data then set the selected mbean which allows UI to display data
        $scope.selectedMBean = response.request.mbean;

      } else {
        // clear data
        $scope.data = [];
      }

      $scope.initDone = "true";

      // ensure web page is updated
      Core.$apply($scope);
    }

    function loadBlockedData() {
      console.log("Loading blocked exchanges data...");

      // pre-select filter if we have selected a route
      var routeId = getSelectedRouteId(workspace);
      if (routeId != null) {
        $scope.gridOptions.filterOptions.filterText = routeId;
      }

      var mbean = getSelectionCamelBlockedExchanges(workspace);
      if (mbean) {

        // grab blocked in real time
        var query = {type: "exec", mbean: mbean, operation: 'browse()'};
        jolokia.request(query, onSuccess(onBlocked));

        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(onSuccess(onBlocked), query));
      }
    }

    // load data
    loadBlockedData();
  }]);

}
