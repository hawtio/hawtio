/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.InflightController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    var log:Logging.Logger = Logger.get("Camel");

    $scope.workspace = workspace;

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
        field: 'elapsed',
        displayName: 'Elapsed (ms)',
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

    function onInflight(response) {
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
              elapsed: entry.elapsed
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

    function loadInflightData() {
      log.info("Loading inflight data...");

      // pre-select filter if we have selected a route
      var routeId = getSelectedRouteId(workspace);
      if (routeId != null) {
        $scope.gridOptions.filterOptions.filterText = routeId;
      }

      var mbean = getSelectionCamelInflightRepository(workspace, camelJmxDomain);
      if (mbean) {

        // grab inflight in real time
        var query = {type: "exec", mbean: mbean, operation: 'browse()'};
        jolokia.request(query, onSuccess(onInflight));

        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(onSuccess(onInflight), query));
      }
    }

    // load data
    loadInflightData();
  }]);

}
