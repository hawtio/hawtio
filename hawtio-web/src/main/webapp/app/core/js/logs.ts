function LogController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;
  //$scope.logs = {};
  $scope.logs = [];
  $scope.toTime = 0;
  $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};

  $scope.filterLogs = function (logs, query) {
    var filtered = [];
    var queryRegExp = null;
    if (query) {
      queryRegExp = RegExp(query.escapeRegExp(), 'i'); //'i' -> case insensitive
    }
    angular.forEach(logs, function (log) {
      if (!query || Object.values(log).any((value) => value && value.toString().has(queryRegExp))) {
        filtered.push(log);
      }
    });
    return filtered;
  };

  $scope.logClass = (log) => {
    return logLevelClass(log['level']);
  };

  var updateValues = function (response) {
    var logs = response.events;
    var toTime = response.toTimestamp;
    if (toTime) {
      $scope.toTime = toTime;
      $scope.queryJSON.arguments = [toTime];
    }
    if (logs) {
      var seq = 0;
      for (var idx in logs) {
        var log = logs[idx];
        if (log) {
          if (!$scope.logs.any((item) => item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp)) {
            $scope.logs.push(log);
          }
        }
      }
      //console.log("Got results " + logs.length + " last seq: " + seq);
      $scope.$apply();
    } else {
      console.log("Failed to get a response! " + response);
    }
  };

  var jolokia = workspace.jolokia;
  jolokia.execute(logQueryMBean, "allLogResults", onSuccess(updateValues));

  // listen for updates adding the since
  var asyncUpdateValues = function (response) {
    var value = response.value;
    if (value) {
      updateValues(value);
    } else {
      console.log("Failed to get a response! " + response);
    }
  };

  var callback = onSuccess(asyncUpdateValues,
          {
            error: (response) => {
              asyncUpdateValues(response);
            }
          });

  scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, $scope.queryJSON));
}
