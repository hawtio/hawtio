/// <reference path="camelPlugin.ts"/>

module Camel {

  _module.controller("Camel.EndpointRuntimeRegistryController", ["$scope", "$location", "workspace", "jolokia", "localStorage", ($scope, $location, workspace:Workspace, jolokia, localStorage) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;
    $scope.data = [];
    $scope.selectedMBean = null;

    $scope.mbeanAttributes = {};

    var columnDefs:any[] = [
      {
        field: 'url',
        displayName: 'Url',
        cellFilter: null,
        width: "500",
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
        field: 'direction',
        displayName: 'Direction',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'static',
        displayName: 'Static',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'dynamic',
        displayName: 'Dynamic',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'hits',
        displayName: 'Hits',
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

    function onEndpointRegistry(response) {
      var obj = response.value;
      if (obj) {

        // the JMX tabular data has 2 indexes so we need to dive 2 levels down to grab the data
        var arr = [];
        for (var key in obj) {
          var entry = obj[key];
          arr.push(
            {
              url: entry.url,
              routeId: entry.routeId,
              direction: entry.direction,
              static: entry.static,
              dynamic: entry.dynamic,
              hits: entry.hits
            }
          );
        }

        arr = arr.sortBy("url");
        $scope.data = arr;

        // okay we have the data then set the selected mbean which allows UI to display data
        $scope.selectedMBean = response.request.mbean;

      } else {

        // set the mbean to a value so the ui can get updated
        $scope.selectedMBean = "true";
      }

      // ensure web page is updated
      Core.$apply($scope);
    }

    function loadEndpointRegistry() {
      console.log("Loading EndpointRuntimeRegistry data...");
      var mbean = getSelectionCamelEndpointRuntimeRegistry(workspace, camelJmxDomain);
      if (mbean) {
        jolokia.request({type: 'exec', mbean: mbean, operation: 'endpointStatistics'}, onSuccess(onEndpointRegistry));
      }
    }

    // load data
    loadEndpointRegistry();
  }]);

}
