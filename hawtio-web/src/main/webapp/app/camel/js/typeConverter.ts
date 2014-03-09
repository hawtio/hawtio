module Camel {

  export function TypeConverterController($scope, $location, workspace:Workspace, jolokia) {

    $scope.data = [];

    var columnDefs:any[] = [
      {
        field: 'from',
        displayName: 'From',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'to',
        displayName: 'To',
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
      filterOptions: {
        filterText: ''
      }
    };

    function render(response) {
      var obj = response.value;
      if (obj) {

        var arr = [];
        for (var key in obj) {
          var values = obj[key];
          for (var v in values) {
            arr.push({from: key, to: v});
          }
        }
        arr = arr.sortBy("from");
        $scope.data = arr;

        // ensure web page is updated
        Core.$apply($scope);
      }
    }

    $scope.$on('jmxTreeUpdated', reloadFunction);
    $scope.$watch('workspace.tree', reloadFunction);

    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }

    function loadData() {
      console.log("Loading TypeConverter data...");
      var mbean = getSelectionCamelTypeConverter(workspace)
      if (mbean) {
        var query = {type: 'exec', mbean: mbean, operation: 'listTypeConverters'};
        jolokia.request(query, onSuccess(render));
      }
    }

  }

}
