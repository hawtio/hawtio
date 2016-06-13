/**
 * @module Jetty
 */
/// <reference path="./jettyPlugin.ts"/>
module Jetty {

  _module.controller("Jetty.ConnectorsController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | jettyIconClass}}"></i></div>';


    $scope.connectors = [];
    $scope.selected = [];

    $scope.sampleConnector = pickSampleConnector();

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
      displayFooter: true,
      selectedItems: $scope.selected,
      columnDefs: columnDefs,
      filterOptions: {
        filterText: ''
      },
      title: "Connectors"
    };


    // function to control the connectors
    $scope.controlConnectors = function (op) {
      // grab id of mbean names to control
      var mbeanNames = $scope.selected.map(function (b) {
        return b.mbean
      });
      if (!angular.isArray(mbeanNames)) {
        mbeanNames = [mbeanNames];
      }

      // execute operation on each mbean
      var lastIndex = (mbeanNames.length || 1) - 1;
      angular.forEach(mbeanNames, (mbean, idx) => {
        var onResponse = (idx >= lastIndex) ? $scope.onLastResponse : $scope.onResponse;
        jolokia.request({
                  type: 'exec',
                  mbean: mbean,
                  operation: op,
                  arguments: null
                },
                onSuccess(onResponse, {error: onResponse}));
      });
    };

    $scope.stop = function () {
      $scope.controlConnectors('stop');
    };

    $scope.start = function () {
      $scope.controlConnectors('start');
    };

    $scope.anySelectionIsRunning = () => {
      var selected = $scope.selected || [];
      return selected.length && selected.any((s) => s.running);
    };

    $scope.everySelectionIsRunning = (state) => {
      var selected = $scope.selected || [];
      return selected.length && selected.every((s) => s.running);
    };


    function render78(response) {
      $scope.connectors = [];
      $scope.selected.length = 0;

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
      $scope.selected.length = 0;

      function onAttributes(response) {
        var obj = response.value;
        if (obj) {
          obj.mbean = response.request.mbean;
          obj.protocols = obj['protocols'];
          obj.default = obj['defaultProtocol'];
          obj.port = obj.port;
          obj.running = obj['state'] == "STARTED";
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
    $scope.onLastResponse = function (response) {
      $scope.onResponse(response);
      // we only want to force updating the data on the last response
      loadData();
    };

    $scope.onResponse = function (response) {
      //console.log("got response: " + response);
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

    // function to pick up a sample connector for RBAC
    function pickSampleConnector() {
      var connectors = jolokia.search("org.eclipse.jetty.server.nio:type=selectchannelconnector,*");
      if (connectors && connectors.length >= 1) {
        return connectors[0];
      }
      connectors = jolokia.search("org.eclipse.jetty.server:type=serverconnector,*");
      if (connectors && connectors.length >= 1) {
        return connectors[0];
      }
      return null;
    }

  }]);
}
