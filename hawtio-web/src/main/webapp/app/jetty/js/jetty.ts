/**
 * @module Jetty
 */
module Jetty {

  export function JettyController($scope, $location, workspace:Workspace, jolokia) {

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | jettyIconClass}}"></i></div>';

    $scope.uninstallDialog = new Core.Dialog()

    $scope.webapps = [];
    $scope.selected = [];

    var columnDefs:any[] = [
      {
        field: 'state',
        displayName: 'State',
        cellTemplate: stateTemplate,
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        resizable: false
      },
      {
        field: 'displayName',
        displayName: 'Name',
        cellFilter: null,
        width: "*",
        resizable: true
      },
      {
        field: 'contextPath',
        displayName: 'Context-Path',
        cellFilter: null,
        width: "*",
        resizable: true
      },
    ];

    $scope.gridOptions = {
      data: 'webapps',
      displayFooter: true,
      selectedItems: $scope.selected,
      columnDefs: columnDefs,
      filterOptions: {
        filterText: ''
      },
      title: "Web applications"
    };

    // function to control the web applications
    $scope.controlWebApps = function (op) {
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
      $scope.controlWebApps('stop');
    };

    $scope.start = function () {
      $scope.controlWebApps('start');
    };

    $scope.uninstall = function () {
      $scope.controlWebApps('destroy');
      $scope.uninstallDialog.close();
    };

    $scope.anySelectionHasState = (state) => {
      var selected = $scope.selected || [];
      return selected.length && selected.any((s) => isState(s, state));
    };

    $scope.everySelectionHasState = (state) => {
      var selected = $scope.selected || [];
      return selected.length && selected.every((s) => isState(s, state));
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

    // grab server information once
    $scope.jettyServerVersion = "";
    $scope.jettyServerStartupTime = "";

    var servers = jolokia.search("org.eclipse.jetty.server:type=server,*")
    if (servers && servers.length === 1) {
      $scope.jettyServerVersion = jolokia.getAttribute(servers[0], "version")
      $scope.jettyServerStartupTime = jolokia.getAttribute(servers[0], "startupTime")
    } else {
      console.log("Cannot find jetty server or there was more than one server. response is: " + servers)
    }


    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }

    function loadData() {
      console.log("Loading Jetty webapp data...");
      // support embedded jetty which may use morbay mbean names
      jolokia.search("org.mortbay.jetty.plugin:type=jettywebappcontext,*", onSuccess(render));
      jolokia.search("org.eclipse.jetty.webapp:type=webappcontext,*", onSuccess(render));
      jolokia.search("org.eclipse.jetty.servlet:type=servletcontexthandler,*", onSuccess(render));
    }

    function render(response) {
      $scope.webapps = [];
      $scope.mbeanIndex = {};
      $scope.selected.length = 0;

      function onAttributes(response) {
        var obj = response.value;
        if (obj) {
          obj.mbean = response.request.mbean;
          if (!obj.state) {
            // lets leave the state as it is if it is defined
            obj.state = obj['running'] === undefined || obj['running'] ? "started" : "stopped"
          }
          var mbean = obj.mbean;
          if (mbean) {
            var idx = $scope.mbeanIndex[mbean];
            if (angular.isDefined(idx)) {
              $scope.webapps[mbean] = obj;
            } else {
              $scope.mbeanIndex[mbean] = $scope.webapps.length;
              $scope.webapps.push(obj);
            }
            Core.$apply($scope);
          }
        }
      }

      angular.forEach(response, function (value, key) {
        var mbean = value;
        jolokia.request({type: "read", mbean: mbean, attribute: []}, onSuccess(onAttributes));
      });
      Core.$apply($scope);
    }
  }
}
