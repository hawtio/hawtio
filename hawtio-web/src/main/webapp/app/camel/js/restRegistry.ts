/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.RestServiceController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {

    $scope.data = [];
    $scope.selectedMBean = null;

    $scope.mbeanAttributes = {};

    var columnDefs:any[] = [
      {
        field: 'url',
        displayName: 'Url',
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
        field: 'uriTemplate',
        displayName: 'Uri Template',
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
        field: 'state',
        displayName: 'State',
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

        var arr = [];
        for (var key in obj) {
          var data = obj[key];
          arr.push({url: key, method: data.method, uriTemplate: data['uri template'], consumes: data.consumes, produces: data.produces, state: data.state});
        }
        arr = arr.sortBy("url");
        $scope.data = arr;

        // okay we have the data then set the selected mbean which allows UI to display data
        $scope.selectedMBean = response.request.mbean;

        // ensure web page is updated
        Core.$apply($scope);
      }
    }

    $scope.renderIcon = (state) => {
      return Camel.iconClass(state);
    }

    function loadRestRegistry() {
      console.log("Loading RestRegistry data...");
      var mbean = getSelectionCamelRestRegistry(workspace);
      if (mbean) {
        jolokia.request({type: 'exec', mbean: mbean, operation: 'listRestServices'}, onSuccess(onRestRegistry));
      }
    }

    // load data
    loadRestRegistry();
  }]);

}
