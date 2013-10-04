module Log {
  export interface ILog {
    // TODO What is the point of seq?
    seq: string;
    message: string;
    timestamp: string;
    logger: string;
    level: string;
  }

  export function LogController($scope, $location, localStorage, workspace:Workspace, $window, $document) {
    $scope.logs = [];
    $scope.filteredLogs = [];
    $scope.selectedItems = [];
    $scope.searchText = "";
    $scope.filter = {
      // The default logging level to show, empty string => show all
      logLevelQuery: "",
      // The default value of the exact match logging filter
      logLevelExactMatch: false
    };
    $scope.toTime = 0;
    $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};


    $scope.logClass = (log) => {
      return logLevelClass(log['level']);
    };

    $scope.logIcon = (log) => {
      var style = $scope.logClass(log);
      if (style === "error") {
        return "red icon-warning-sign";
      }
      if (style === "warning") {
        return "orange icon-exclamation-sign";
      }
      if (style === "info") {
        return "icon-info-sign";
      }
      return "icon-cog";
    };

    $scope.logSourceHref = Log.logSourceHref;

    $scope.hasLogSourceHref = (row) => {
      return Log.hasLogSourceHref(row);
    };

    $scope.dateFormat = 'yyyy-MM-dd HH:mm:ss';

    $scope.formatException = (line) => {
      return Log.formatStackLine(line);
    };

    $scope.getSupport = () => {
      if ($scope.selectedItems.length) {
        var log = $scope.selectedItems[0];
        var text = log["message"];
        var uri = "https://access.redhat.com/knowledge/solutions?logger=" + log["logger"] + "&text=" + text;
        window.location.href = uri;
      }
    };

    var columnDefs:any[] = [
      {
        field: 'timestamp',
        displayName: 'Timestamp',
        cellFilter: "logDateFilter",
        width: 146
      },
      {
        field: 'level',
        displayName: 'Level',
        cellTemplate: '<div class="ngCellText"><span class="text-{{logClass(row.entity)}}"><i class="{{logIcon(row.entity)}}"></i> {{row.entity.level}}</span></div>',
        cellFilter: null,
        width: 74,
        resizable: false
      },
      {
        field: 'logger',
        displayName: 'Logger',
        cellTemplate: '<div class="ngCellText" ng-switch="hasLogSourceHref(row)" title="{{row.entity.logger}}"><a ng-href="{{logSourceHref(row)}}" ng-switch-when="true">{{row.entity.logger}}</a><div ng-switch-default>{{row.entity.logger}}</div></div>',
        cellFilter: null,
        //width: "**"
        width: "20%"
      },
      {
        field: 'message',
        displayName: 'Message',
        //width: "****"
        width: "60%"
      }
    ];


    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      data: 'filteredLogs',
      displayFooter: false,
      showFilter: false,
      sortInfo: { field: 'timestamp', direction: 'DESC'},
      filterOptions: {
        filterText: "searchText"
      },
      columnDefs: columnDefs,
      rowDetailTemplateId: "logDetailTemplate"
      //rowTemplate: '<div ng-style="{\'cursor\': row.cursor}" ng-repeat="col in visibleColumns()" class="{{logClass(row.entity)}} ngCell col{{$index}} {{col.cellClass}}" ng-cell></div>'
    };

    $scope.$watch('filter.logLevelExactMatch', function () {
      checkIfFilterChanged();
    });
    $scope.$watch('filter.logLevelQuery', function () {
      checkIfFilterChanged();
    });

    function getDocHeight() {
      var D = document;
      return Math.max(
          Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
          Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
          Math.max(D.body.clientHeight, D.documentElement.clientHeight)
      );
    }

    var updateValues = function (response) {
      var scrollToBottom = false;
      var window = $($window);

      //console.log("ScrollTop: ", $document.scrollTop());
      //console.log("documentHeight: ", $document.height());

      if ($scope.logs.length === 0) {
        // initial page load, let's scroll to the bottom
        scrollToBottom = true;
      }

      //console.log("window.scrollTop() + window.height()", window.scrollTop() + window.height());

      //console.log("getDocHeight() - 100: ", getDocHeight() - 100);

      if ( (window.scrollTop() + window.height()) > (getDocHeight() - 100) ) {
        //console.log("Scrolling to bottom...");
        // page is scrolled near the bottom
        scrollToBottom = true;
      }

      var logs = response.events;
      var toTime = response.toTimestamp;
      if (toTime && angular.isNumber(toTime)) {
        if (toTime < 0) {
          // on JBoss we get odd values and never seem to get any log events!
          console.log("ignoring dodgy value of toTime: " + toTime);
        } else {
          $scope.toTime = toTime;
          $scope.queryJSON.arguments = [toTime];
        }
      }
      if (logs) {
        var maxSize = getLogCacheSize(localStorage);
        var counter = 0;
        logs.forEach((log:ILog) => {
          if (log) {
            // TODO Why do we compare 'item.seq === log.message' ?
            if (!$scope.logs.any((key, item:ILog) => item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp)) {
              counter += 1;
              $scope.logs.push(log);
            }
          }
        });
        if (maxSize > 0) {
          var size = $scope.logs.length;
          if (size > maxSize) {
            // lets trim the log size
            var count = size - maxSize;
            $scope.logs.splice(0, count);
          }
        }
        if (counter) {
          refilter();
          if (scrollToBottom) {
            setTimeout(() => {
              $document.scrollTop( $document.height() - window.height());
            }, 20);
          }
          Core.$apply($scope);
        }
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

    var logLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];
    var logLevelMap = {};
    angular.forEach(logLevels, (name, idx) => {
      logLevelMap[name] = idx;
      logLevelMap[name.toLowerCase()] = idx;
    });

    function checkIfFilterChanged() {
      if ($scope.logLevelExactMatch !== $scope.filter.logLevelExactMatch ||
              $scope.logLevelQuery !== $scope.filter.logLevelExactMatch) {
        refilter();
      }
    }

    function refilter() {
      //console.log("refilter logs");
      var logLevelExactMatch = $scope.filter.logLevelExactMatch;
      var logLevelQuery = $scope.filter.logLevelQuery;
      var logLevelQueryOrdinal = (logLevelExactMatch) ? 0 : logLevelMap[logLevelQuery];

      $scope.logLevelExactMatch = logLevelExactMatch;
      $scope.logLevelQuery = logLevelQuery;

      $scope.filteredLogs = $scope.logs.filter((log) => {
        if (logLevelQuery) {
          if (logLevelExactMatch) {
            return log.level === logLevelQuery;
          } else {
            var idx = logLevelMap[log.level];
            return idx >= logLevelQueryOrdinal || idx < 0;
          }
        }
        return true;
      });
      Core.$apply($scope);
    }
  }
}
