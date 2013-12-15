/**
 * @module Jetty
 */
module Jetty {

  export function ThreadPoolsController($scope, $location, workspace:Workspace, jolokia) {

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | jettyIconClass}}"></i></div>';

    $scope.threadpools = [];

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
        field: 'threads',
        displayName: 'Threads',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'minThreads',
        displayName: 'Min Threads',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'maxThreads',
        displayName: 'Max Threads',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'idleThreads',
        displayName: 'Idle Threads',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'idleTimeout',
        displayName: 'Idle Timeout (ms)',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'name',
        displayName: 'Name',
        cellFilter: null,
        width: "*",
        resizable: true
      }
    ];

    $scope.gridOptions = {
      data: 'threadpools',
      displayFooter: true,
      canSelectRows: false,
      columnDefs: columnDefs,
      title: "Thread Pools"
    };

    function render78(response) {
      $scope.threadpools = [];

      function onAttributes(response) {
        var obj = response.value;
        if (obj) {
          // jetty78 vs jetty9 is a bit different
          obj.running = obj['running'] !== undefined ? obj['running'] : obj['state'] == "STARTED";
          obj.idleTimeout = obj['idleTimeout'] !== undefined ? obj['idleTimeout'] : obj['maxIdleTimeMs'];
          $scope.threadpools.push(obj);
        }
      }

      // create structure for each response
      angular.forEach(response, function (value, key) {
        var mbean = value;
        jolokia.request({type: "read", mbean: mbean, attribute: []}, onSuccess(onAttributes));
      });
      Core.$apply($scope);
    };

    $scope.$on('jmxTreeUpdated', reloadFunction);
    $scope.$watch('workspace.tree', reloadFunction);

    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }

    function loadData() {
      console.log("Loading Jetty thread pool data...");
      var tree = workspace.tree;

      jolokia.search("org.eclipse.jetty.util.thread:type=queuedthreadpool,*", onSuccess(render78));
    }

  }
}
