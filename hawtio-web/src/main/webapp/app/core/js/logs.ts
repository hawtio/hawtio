module Core {
    export interface ILog {
        // TODO What is the point of seq?
        seq: string;
        message: string;
        timestamp: string;
        logger: string;
        level: string;
    }

    export interface ILogControllerScope extends IMyAppScope {
        workspace: Workspace;
        logs : ILog[];
        toTime: number;
        queryJSON: any;
        logLevelQuery: string;
        logClass: (log: string) => string;
    }

    export function LogController($scope : ILogControllerScope, $location, workspace:Workspace) {
      $scope.workspace = workspace;
      //$scope.logs = {};
      $scope.logs = [];
      $scope.toTime = 0;
      $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};
      // The default logging level to show, empty string => show all
      $scope.logLevelQuery = "";

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
          logs.forEach((log : ILog) => {
            if (log) {
             // TODO Why do we compare 'item.seq === log.message' ?
             if (!$scope.logs.any((key, item : ILog) => item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp)) {
               $scope.logs.push(log);
              }
             }
          });

          //console.log("Got results " + logs.length + " last seq: " + seq);
          $scope.$apply("");
        } else {
            notification("error", "Failed to get a response! " + JSON.stringify(response, null, 4));
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
          notification("error", "Failed to get a response! " + JSON.stringify(response, null, 4));
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

}