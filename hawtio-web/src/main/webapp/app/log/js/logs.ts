/**
 * @module Log
 */
module Log {

  var log:Logging.Logger = Logger.get("Log");

  export interface ILog {
    seq: string;
    timestamp: string;
    level: string;
    logger: string;
    message: string;
    sortSeq: number;
  }

  export function LogController($scope, $routeParams, $location, localStorage, workspace:Workspace, $window, $document, $templateCache) {
    $scope.sortAsc = true;
    var value = localStorage["logSortAsc"];
    if (angular.isString(value)) {
      $scope.sortAsc = "true" === value;
    }
    $scope.sortField = 'sortSeq';
    $scope.autoScroll = true;
    var value = localStorage["logAutoScroll"];
    if (angular.isString(value)) {
      $scope.autoScroll = "true" === value;
    }

    $scope.logs = [];
    $scope.showRowDetails = false;
    $scope.showRaw = {
      expanded: false
    };

    var logQueryMBean = Log.findLogQueryMBean(workspace);

    $scope.init = () => {
      $scope.searchText = $routeParams['s'];

      if (!angular.isDefined($scope.searchText)){
        $scope.searchText = '';
      }

      $scope.filter = {
        // The default logging level to show, empty string => show all
        logLevelQuery: $routeParams['l'],
        // The default value of the exact match logging filter
        logLevelExactMatch: Core.parseBooleanValue($routeParams['e']),
        // The default value of the search only in message field filter
        messageOnly: Core.parseBooleanValue($routeParams['o'])
      };

      if (!angular.isDefined($scope.filter.logLevelQuery)) {
        $scope.filter.logLevelQuery = '';
      }
      if (!angular.isDefined($scope.filter.logLevelExactMatch)) {
        $scope.filter.logLevelExactMatch = false;
      }
      if (!angular.isDefined($scope.filter.messageOnly)) {
        $scope.filter.messageOnly = false;
      }
    };

    $scope.$on('$routeUpdate', $scope.init);

    $scope.$watch('searchText', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $location.search('s', newValue);
      }
    });

    $scope.$watch('filter.logLevelQuery', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $location.search('l', newValue);
      }
    });

    $scope.$watch('filter.logLevelExactMatch', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $location.search('e', newValue);
      }
    });

    $scope.$watch('filter.messageOnly', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $location.search('o', newValue);
      }
    });

    $scope.init();

    $scope.sortCounter = 0;
    $scope.toTime = 0;
    $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};


    $scope.logLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];
    $scope.logLevelMap = {};
    $scope.skipFields = ['seq'];

    angular.forEach($scope.logLevels, (name, idx) => {
      $scope.logLevelMap[name] = idx;
      $scope.logLevelMap[name.toLowerCase()] = idx;
    });

    $scope.selectedClass = ($index) => {
      if ($index === $scope.selectedRowIndex) {
        return 'selected';
      }
      return '';
    };

    $scope.$watch('selectedRowIndex', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue < 0 || newValue > $scope.logs.length) {
          $scope.selectedRow = null;
          $scope.showRowDetails = false;
          return;
        }
        Log.log.debug("New index: ", newValue);
        $scope.selectedRow = $scope.logs[newValue];
        if (!$scope.showRowDetails) {
          $scope.showRowDetails = true;
        }
      }
    });

    $scope.hasOSGiProps = (row) => {
      if (!row) {
        return false;
      }
      if (!('properties' in row)) {
        return false;
      }
      var props = row.properties;
      var answer = Object.extended(props).keys().any((key) => { return key.startsWith('bundle'); });
      return answer;
    };

    $scope.selectRow = ($index) => {
      // in case the user clicks a row, closes the slideout and clicks
      // the row again
      if ($scope.selectedRowIndex == $index) {
        $scope.showRowDetails = true;
        return;
      }
      $scope.selectedRowIndex = $index;
    };

    $scope.getSelectedRowJson = () => {
      return angular.toJson($scope.selectedRow, true);
    };

    $scope.logClass = (log) => {
      if (!log) {
        return '';
      }
      return logLevelClass(log['level']);
    };

    $scope.logIcon = (log) => {
      if (!log) {
        return '';
      }
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
      if (!row) {
        return false;
      }
      return Log.hasLogSourceHref(row);
    };

    $scope.hasLogSourceLineHref = (row) => {
      if (!row) {
        return false;
      }
      return Log.hasLogSourceLineHref(row);
    };

    $scope.dateFormat = 'yyyy-MM-dd HH:mm:ss';

    $scope.formatException = (line) => {
      return Log.formatStackLine(line);
    };

    $scope.getSupport = () => {
      if (!$scope.selectedRow) {
        return;
      }
      var uri =  "https://access.redhat.com/knowledge/solutions"
      var text = $scope.selectedRow.message;
      var logger = $scope.selectedRow.logger;
      uri = uri + "?logger=" + logger + "&text=" + text;
      window.location.href = uri;
    };


    $scope.addToDashboardLink = () => {
      var href = "#/logs"
      var routeParams = angular.toJson($routeParams)
      var size = angular.toJson({
        size_x: 8,
        size_y: 1
      });
      var title = "Logs";
      if ($scope.filter.logLevelQuery !== "") {
        title = title + " LogLevel: " + $scope.filter.logLevelQuery;
      }
      if ($scope.filter.logLevelExactMatch) {
        title = title + " Exact Match";
      }
      if ($scope.searchText !== "") {
        title = title + " Filter: " + $scope.searchText;
      }
      if ($scope.filter.messageOnly) {
        title = title + " Message Only";
      }

      return "#/dashboard/add?tab=dashboard" +
          "&href=" + encodeURIComponent(href) +
          "&routeParams=" + encodeURIComponent(routeParams) +
          "&title=" + encodeURIComponent(title) +
          "&size=" + encodeURIComponent(size);
    };

    $scope.isInDashboardClass = () => {
      if (angular.isDefined($scope.inDashboard && $scope.inDashboard)) {
        return "log-table-dashboard";
      }
      return "";
    };

    $scope.sortIcon = () => {
      if ($scope.sortAsc) {
        return "icon-arrow-down";
      } else {
        return "icon-arrow-up";
      }
    };

    $scope.filterLogMessage = (log) => {
      var messageOnly = $scope.filter.messageOnly;

      if ($scope.filter.logLevelQuery !== "") {
        var logLevelExactMatch = $scope.filter.logLevelExactMatch;
        var logLevelQuery = $scope.filter.logLevelQuery;
        var logLevelQueryOrdinal = (logLevelExactMatch) ? 0 : $scope.logLevelMap[logLevelQuery];

        if (logLevelExactMatch) {
          if (log.level !== logLevelQuery) {
            return false;
          }
        } else {
          var idx = $scope.logLevelMap[log.level];
          if ( !(idx >= logLevelQueryOrdinal || idx < 0) ) {
            return false;
          }
        }
      }

      if ($scope.searchText.startsWith("l=")) {
        return log.logger.has($scope.searchText.last($scope.searchText.length - 2));
      }
      if ($scope.searchText.startsWith("m=")) {
        return log.message.has($scope.searchText.last($scope.searchText.length - 2));
      }
      if (messageOnly) {
        return log.message.has($scope.searchText);
      }
      return log.logger.has($scope.searchText) || log.message.has($scope.searchText);
    };


    $scope.formatStackTrace = (exception) => {
      if (!exception) {
        return "";
      }
      var answer = '<ul class="unstyled">\n';
      exception.forEach((line) => {
        answer = answer + '<li>' + $scope.formatException(line) + '</li>';
      });
      answer += '\n</ul>';
      return answer;
    };


    var updateValues = function (response) {

      if (!$scope.inDashboard) {
        var window = $($window);

        if ($scope.sortAsc) {
          var pos = window.scrollTop() + window.height();
          var threshold = Core.getDocHeight() - 100;
        } else {
          var pos = window.scrollTop() + window.height();
          var threshold = 100;
        }
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
        //don't really need many logs in a widget...
        if ($scope.inDashboard) {
          maxSize = 10;
        }
        var counter = 0;
        logs.forEach((log:ILog) => {
          if (log) {
            log.sortSeq = $scope.sortCounter++;
            // TODO Why do we compare 'item.seq === log.message' ?
            if (!$scope.logs.any((key, item:ILog) => item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp)) {
              counter += 1;
              // if there is a seq in the reply, then its the timestamp with milli seconds
              if (log.seq != null) {
                log['timestampMs'] = log.seq;
              }
              if ($scope.sortAsc) {
                $scope.logs.push(log);
              } else {
                $scope.logs.unshift(log);
              }
            }
          }
        });
        if (maxSize > 0) {
          var size = $scope.logs.length;
          if (size > maxSize) {
            // lets trim the log size
            var count = size - maxSize;
            var pos = 0;
            if (!$scope.sortAsc) {
              pos = size - count;
            }

            $scope.logs.splice(pos, count);

            if ($scope.showRowDetails) {
              if ($scope.sortAsc) {
                $scope.selectedRowIndex -= count;
              } else {
                $scope.selectedRowIndex += count;
              }
            }

          }
        }
        if (counter) {
          if ($scope.autoScroll) {
            setTimeout(() => {
              var pos = 0;
              if ($scope.sortAsc) {
                pos = $document.height() - window.height();
              }else{
                pos = window.height() - $document.height();
              }
              log.debug("Scrolling to position: " + pos)
              $document.scrollTop(pos);
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


    if (logQueryMBean) {
      scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, $scope.queryJSON));
    }
  }

}
