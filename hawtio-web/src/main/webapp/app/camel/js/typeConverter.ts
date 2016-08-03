/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.TypeConverterController", ["$scope", "$location", "$timeout", "workspace", "jolokia", "localStorage", ($scope, $location, $timeout, workspace:Workspace, jolokia, localStorage) => {
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;

    $scope.data = [];
    $scope.selectedMBean = null;

    $scope.mbeanAttributes = {};
    $scope.enableTypeConvertersStats = false;
    $scope.disableTypeConvertersStats = false;
    $scope.defaultTimeout = 3000;

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
      selectedItems: [],
      filterOptions: {
        filterText: ''
      }
    };

    function onAttributes(response) {
      var obj = response.value;
      if (obj) {
        $scope.mbeanAttributes = obj;

        // ensure web page is updated
        Core.$apply($scope);
      }
    }

    function onConverters(response) {
      var obj = response.value;
      if (obj) {

        // the JMX tabular data has 2 indexes so we need to dive 2 levels down to grab the data
        var arr = [];
        for (var key in obj) {
          var values = obj[key];
          for (var v in values) {
            arr.push({from: key, to: v});
          }
        }
        arr = arr.sortBy("from");
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

    $scope.disableStatistics = () => {
      $scope.disableTypeConvertersStats = true;
      if ($scope.selectedMBean) {
        jolokia.setAttribute($scope.selectedMBean, "StatisticsEnabled", false);
      }
      $timeout(function () { $scope.disableTypeConvertersStats = false; }, $scope.defaultTimeout);
    }

    $scope.enableStatistics = () => {
      $scope.enableTypeConvertersStats = true;
      if ($scope.selectedMBean) {
        jolokia.setAttribute($scope.selectedMBean, "StatisticsEnabled", true);
      }
      $timeout(function () { $scope.enableTypeConvertersStats = false; }, $scope.defaultTimeout);
    }

    $scope.resetStatistics = () => {
      if ($scope.selectedMBean) {
        jolokia.request({type: 'exec', mbean: $scope.selectedMBean, operation: 'resetTypeConversionCounters'}, onSuccess(null, {silent: true}));
      }
    }

    function loadConverters() {
      console.log("Loading TypeConverter data...");
      var mbean = getSelectionCamelTypeConverter(workspace, camelJmxDomain);
      if (mbean) {
        // grab attributes in real time
        var query = {type: "read", mbean: mbean,
          attribute: ["AttemptCounter", "FailedCounter", "HitCounter", "MissCounter", "NumberOfTypeConverters", "StatisticsEnabled"]};

        jolokia.request(query, onSuccess(onAttributes));

        scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(onAttributes, query));

        // and list of converters
        jolokia.request({type: 'exec', mbean: mbean, operation: 'listTypeConverters'}, onSuccess(onConverters));
      }
    }

    // load converters
    loadConverters();
  }]);

}
