/**
 * @module Jetty
 */
module Jetty {

  export function ConnectorsController($scope, $location, workspace:Workspace, jolokia) {

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | jettyIconClass}}"></i></div>';

    $scope.connectors = [];

    var columnDefs:any[] = [
      {
        field: 'running',
        displayName: 'State',
        cellTemplate: stateTemplate,
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        resizable: false
      },
      {
        field: 'port',
        displayName: 'Port',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'protocols',
        displayName: 'Protocols',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'default',
        displayName: 'Default',
        cellFilter: null,
        width: "*",
        resizable: true
      },
    ];

    $scope.gridOptions = {
      data: 'connectors',
      displayFooter: false,
      displaySelectionCheckbox: false,
      canSelectRows: false,
      columnDefs: columnDefs,
      filterOptions: {
        filterText: ''
      }
    };

    function render78(response) {
      $scope.connectors = [];

      function onAttributes(response) {
        var obj = response.value;
        if (obj) {
          // split each into 2 rows as we want http and https on each row
          obj.mbean = response.request.mbean;
          obj.protocols = "[http]";
          obj.default = "http";
          obj.port = obj.port;
          obj.running = obj['running'] !== undefined ? obj['running'] : true;
          $scope.connectors.push(obj);
          if (obj.confidentialPort) {
            // create a clone of obj for https
            var copyObj = {
              protocols: "[https]",
              default: "https",
              port: obj.confidentialPort,
              running: obj.running,
              mbean: obj.mbean
            }
            $scope.connectors.push(copyObj);
          }
          Core.$apply($scope);
        }
      }

      // create structure for each response
      angular.forEach(response, function (value, key) {
        var mbean = value;
        jolokia.request({type: "read", mbean: mbean, attribute: []}, onSuccess(onAttributes));
      });
      Core.$apply($scope);
    };

    function render9(response) {
      $scope.connectors = [];

      function onAttributes(response) {
        var obj = response.value;
        if (obj) {
          obj.mbean = response.request.mbean;
          obj.protocols = obj['protocols'];
          obj.default = obj['defaultProtocol'];
          obj.port = obj.port;
          obj.running = obj['running'] !== undefined ? obj['running'] : true;
          $scope.connectors.push(obj);
          Core.$apply($scope);
        }
      }

      // create structure for each response
      angular.forEach(response, function (value, key) {
        var mbean = value;
        jolokia.request({type: "read", mbean: mbean, attribute: []}, onSuccess(onAttributes));
      });
      Core.$apply($scope);
    };

    // function to trigger reloading page
    $scope.onResponse = function (response) {
      //console.log("got response: " + response);
      loadData();
    };

    $scope.$on('jmxTreeUpdated', reloadFunction);
    $scope.$watch('workspace.tree', reloadFunction);

    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }


    function loadData() {
      console.log("Loading Jetty connector data...");
      var tree = workspace.tree;

      jolokia.search("org.eclipse.jetty.server.nio:type=selectchannelconnector,*", onSuccess(render78));
      jolokia.search("org.eclipse.jetty.server:type=serverconnector,*", onSuccess(render9));
    }

  }
}
