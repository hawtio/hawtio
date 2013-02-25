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
    $scope.toTime = 0;
    $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};
    // The default logging level to show, empty string => show all
    $scope.logLevelQuery = "";
    // The default value of the exact match logging filter
    $scope.logLevelExactMatch = true;

    $scope.logClass = (log) => {
      return logLevelClass(log['level']);
    };

    $scope.logSourceHref = (row) => {
      var log = row.entity;
      var fileName = log.fileName;
      var className = log.className;
      if ((!fileName || fileName === "?") && className) {
        fileName = className.replace(".", "/") + ".java";
      }
      var groupId = "";
      var artifactId = "";
      var version = "";
      var properties = log.properties;
      if (properties) {
        var coords = properties["maven.coordinates"];
        if (coords) {
          var values = coords.split(":");
          if (values.length > 2) {
            groupId = values[0];
            artifactId = values[1];
            version = values[2];
          }
        }
      }
      if (groupId && artifactId && version) {
        return "#/source/view/" + groupId + "/" + artifactId + "/" + version + "/" + fileName;
      } else {
        return "";
      }
    };

    var columnDefs: any[] = [
            {
              field: 'timestamp',
              displayName: 'Timestamp',
              cellFilter: "date:'yyyy-MM-dd HH:mm:ss'",
              width: "*"
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
              cellTemplate: '<div class="ngCellText" ng-switch><a ng-href="{{logSourceHref(row)}}" ng-switch-when="logSourceHref(row)">{{row.getProperty(col.field)}}</a><div ng-switch-default>{{row.getProperty(col.field)}}</div></div>',
              cellFilter: null,
              width: "*"
            },
            {
              field: 'message',
              displayName: 'Message',
              width: "***"
            }
          ];
    $scope.gridOptions = {
      data: 'logs',
      displayFooter: false,
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