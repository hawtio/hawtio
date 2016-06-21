/**
 * @module Jetty
 */
/// <reference path="./jettyPlugin.ts"/>
module Jetty {

  _module.controller("Jetty.JettyController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location, workspace:Workspace, jolokia) => {

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}">' +
        '<i class="{{row.getProperty(col.field) | jettyIconClass}}"></i>' +
      '</div>';
    var urlTemplate = '<div class="ngCellText" title="{{row.getProperty(col.field)}}">' +
        '<a ng-href="{{row.getProperty(col.field)}}" target="_blank">{{row.getProperty(col.field)}}</a>' +
      '</div>';

    var webappMBeans:string[] = [
      // support embedded jetty which may use mortbay mbean names
      "org.mortbay.jetty.plugin:type=jettywebappcontext,*",
      "org.eclipse.jetty.webapp:type=webappcontext,*",
      "org.eclipse.jetty.servlet:type=servletcontexthandler,*",
      // for OSGi container
      "org.ops4j.pax.web.service.jetty.internal:type=httpservicecontext,*"
    ];

    $scope.uninstallDialog = new UI.Dialog();

    $scope.uninstall = function () {
      $scope.controlWebApps('destroy');
      $scope.uninstallDialog.close();
    };

    $scope.httpPort;
    $scope.httpScheme = "http";

    $scope.webapps = [];
    $scope.selected = [];

    $scope.sampleWebApp = pickSampleWebApp();

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
      {
        field: 'url',
        displayName: 'Url',
        cellTemplate: urlTemplate,
        cellFilter: null,
        width: "*",
        resizable: true
      }
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
      // check Pax-Web Jetty instances in case of being on an OSGi container
      var paxServers = jolokia.search("org.ops4j.pax.web.service.jetty.internal:type=jettyserverwrapper,*")
      if (paxServers && paxServers.length === 1) {
        $scope.jettyServerVersion = jolokia.getAttribute(paxServers[0], "version")
        $scope.jettyServerStartupTime = jolokia.getAttribute(paxServers[0], "startupTime")
      } else {
        console.log("Cannot find jetty server or there was more than one server. response is: "
                    + servers.concat(paxServers))
      }
    }


    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }

    function loadData() {
      console.log("Loading Jetty webapp data...");
      // must load connectors first, before showing applications, so we do this call synchronously
      // jetty 7/8
      var connectors = jolokia.search("org.eclipse.jetty.server.nio:type=selectchannelconnector,*");
      if (!connectors) {
        // jetty 9
        connectors = jolokia.search("org.eclipse.jetty.server:type=serverconnector,*");
      }
      if (connectors) {
        var found = false;
        angular.forEach(connectors, function (key, value) {
          var mbean = key;
          if (!found) {
            var data = jolokia.request({type: "read", mbean: mbean, attribute: ["port", "protocols"]});
            if (data && data.value && data.value.protocols && data.value.protocols.toString().toLowerCase().startsWith("http")) {
              found = true;
              $scope.httpPort = data.value.port;
              $scope.httpScheme = "http";
            }
          }
        });
      }
      angular.forEach(webappMBeans, (mbean) => {
        jolokia.search(mbean, onSuccess(render));
      });
    }

    // function to pick up a sample application for RBAC
    function pickSampleWebApp() {
      for (var i = 0; i < webappMBeans.length; i++) {
        var webapps = jolokia.search(webappMBeans[i]);
        if (webapps && webapps.length >= 1) {
          return webapps[0];
        }
      }
      return null;
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

          // compute the url for the webapp, and we want to use http as scheme
          var hostname = Core.extractTargetUrl($location, $scope.httpScheme, $scope.httpPort);
          obj.url = hostname + obj['contextPath'];

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
  }]);
}
