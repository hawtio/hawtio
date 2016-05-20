/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.RestServiceController", ["$scope", "$location", "workspace", "jolokia", "localStorage", ($scope, $location, workspace:Workspace, jolokia, localStorage) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;

    $scope.data = [];
    $scope.selectedMBean = null;

    $scope.mbeanAttributes = {};

    var columnDefs:any[] = [
      {
        field: 'url',
        displayName: 'Absolute Url',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'baseUrl',
        displayName: 'Base Url',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'basePath',
        displayName: 'Base Path',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'uriTemplate',
        displayName: 'Uri Template',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'method',
        displayName: 'Method',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'consumes',
        displayName: 'Consumes',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'produces',
        displayName: 'Produces',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'inType',
        displayName: 'Input Type',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'outType',
        displayName: 'Output Type',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'state',
        displayName: 'State',
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
        field: 'description',
        displayName: 'Description',
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

    function onRestRegistry(response) {
      var obj = response.value;
      if (obj) {

        // the JMX tabular data has 2 indexes so we need to dive 2 levels down to grab the data
        var arr = [];
        for (var key in obj) {
          var values = obj[key];
          for (var v in values) {
            var entry = values[v];
            arr.push(
              {
                url: entry.url,
                baseUrl: entry.baseUrl,
                basePath: entry.basePath,
                uriTemplate: entry.uriTemplate,
                method: entry.method,
                consumes: entry.consumes,
                produces: entry.produces,
                inType: entry.inType,
                outType: entry.outType,
                state: entry.state,
                routeId: entry.routeId,
                description: entry.description
              }
            );
          }
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

    $scope.renderIcon = (state) => {
      return Camel.iconClass(state);
    }

    function loadRestRegistry() {
      console.log("Loading RestRegistry data...");
      var mbean = getSelectionCamelRestRegistry(workspace, camelJmxDomain);
      if (mbean) {
        jolokia.request({type: 'exec', mbean: mbean, operation: 'listRestServices'}, onSuccess(onRestRegistry));
      }
    }

    // load data
    loadRestRegistry();
  }]);

}
