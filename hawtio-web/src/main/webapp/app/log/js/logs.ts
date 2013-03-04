module Log {
  export interface ILog {
    // TODO What is the point of seq?
    seq: string;
    message: string;
    timestamp: string;
    logger: string;
    level: string;
  }

  export function LogController($scope, $location, workspace:Workspace) {
    $scope.logs = [];
    $scope.filter = { searchText: null };
    $scope.toTime = 0;
    $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};
    // The default logging level to show, empty string => show all
    $scope.logLevelQuery = "";
    // The default value of the exact match logging filter
    $scope.logLevelExactMatch = true;

    var logLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];

    $scope.logClass = (log) => {
      return logLevelClass(log['level']);
    };

    $scope.logSourceHref = Log.logSourceHref;

    $scope.hasLogSourceHref = (row) => {
      return Log.logSourceHref(row) ? true : false;
    };

    $scope.dateFormat = 'yyyy-MM-dd HH:mm:ss';

    var columnDefs: any[] = [
            {
              field: 'timestamp',
              displayName: 'Timestamp',
              cellFilter: "logDateFilter",
              width: "*",
              sortFn: (a, b) => {
                return true;
              }
            },
            {
              field: 'level',
              displayName: 'Level',
              cellFilter: null,
              width: 58,
              resizable: false
            },
            {
              field: 'logger',
              displayName: 'Logger',
              cellTemplate: '<div class="ngCellText" ng-switch="hasLogSourceHref(row)"><a ng-href="{{logSourceHref(row)}}" ng-switch-when="true">{{row.getProperty(col.field)}}</a><div ng-switch-default>{{row.getProperty(col.field)}}</div></div>',
              cellFilter: null,
              width: "*"
            },
            {
              field: 'message',
              displayName: 'Message',
              width: "***"
            }
          ];


/*
      // Used to represent the ordinal value of a log level
      return (logs:Log.ILog[], logLevelQuery, logLevelExactMatch:bool) => {
        if (logLevelQuery === "") {
          return logs;
        }
        // Exact match filtering
        if (logLevelExactMatch) {
          var filteredLogs = logs.filter((log:Log.ILog) => log.level === logLevelQuery);
          return filteredLogs;
        } else {
          // Filtering based on ordinal value, e.g. >= INFO (e.g. INFO would include WARN and ERROR)
          var logLevelQueryOrdinal = logLevels.indexOf(logLevelQuery);
          var filteredLogs = logs.filter((log:Log.ILog) => {
            var logLevelOrdinal = logLevels.indexOf(log.level);
            return logLevelOrdinal >= logLevelQueryOrdinal;
          });
          return filteredLogs;
        }
      };
    });

    var searchProvider = new SearchProvider($scope, $location);
*/

    $scope.gridOptions = {
      //plugins: [searchProvider],
      data: 'logs',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: "filter.searchText"
      },
      columnDefs: columnDefs
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
        logs.forEach((log:ILog) => {
          if (log) {
            // TODO Why do we compare 'item.seq === log.message' ?
            if (!$scope.logs.any((key, item:ILog) => item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp)) {
              $scope.logs.push(log);
            }
          }
        });

        //console.log("Got results " + logs.length + " last seq: " + seq);
        $scope.$apply();
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