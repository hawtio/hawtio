/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.BlockedExchangesController", ["$scope", "$location", "workspace", "jolokia", "localStorage", ($scope, $location, workspace:Workspace, jolokia, localStorage) => {
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
        field: 'threadId',
        displayName: 'Thread id',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'threadName',
        displayName: 'Thread name',
        cellFilter: null,
        width: "*",
        resizable: true
      }
    ];

    $scope.gridOptions = {
      data: 'data',
      displayFooter: true,
      displaySelectionCheckbox: true,
      multiSelect: false,
      canSelectRows: true,
      enableSorting: true,
      columnDefs: columnDefs,
      selectedItems: [],
      filterOptions: {
        filterText: ''
      }
    };

    $scope.doUnblock = () => {
      var mbean = getSelectionCamelBlockedExchanges(workspace, camelJmxDomain);
      var selectedItems = $scope.gridOptions.selectedItems;

      if (mbean && selectedItems && selectedItems.length === 1) {
        var exchangeId = selectedItems[0].exchangeId;
        var threadId = selectedItems[0].threadId;
        var threadName = selectedItems[0].threadName;

        log.info("Unblocking thread (" + threadId + "/" + threadName + ") for exchangeId: " + exchangeId);

        jolokia.execute(mbean, "interrupt(java.lang.String)", exchangeId, onSuccess(onUnblocked));
      }
    };

    function onUnblocked() {
      Core.notification("success", "Thread unblocked");
    }

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
              threadId: entry.id,
              threadName: entry.name
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
      log.info("Loading blocked exchanges data...");

      // pre-select filter if we have selected a route
      var routeId = getSelectedRouteId(workspace);
      if (routeId != null) {
        $scope.gridOptions.filterOptions.filterText = routeId;
      }

      var mbean = getSelectionCamelBlockedExchanges(workspace, camelJmxDomain);
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
