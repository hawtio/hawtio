/**
 * @module Log
 */
module Log {
  export interface ILog {
    // TODO What is the point of seq?
    seq: string;
    message: string;
    timestamp: string;
    logger: string;
    level: string;
  }

  export function LogController($scope, $routeParams, $location, localStorage, workspace:Workspace, $window, $document) {
    $scope.logs = [];

    $scope.branding = Branding.enabled;

    $scope.init = () => {
      $scope.searchText = $routeParams['s'];

      if (!angular.isDefined($scope.searchText)){
        $scope.searchText = '';
      }

      $scope.filter = {
        // The default logging level to show, empty string => show all
        logLevelQuery: $routeParams['l'],
        // The default value of the exact match logging filter
        logLevelExactMatch: Core.parseBooleanValue($routeParams['e'])
      };

      if (!angular.isDefined($scope.filter.logLevelQuery)) {
        $scope.filter.logLevelQuery = '';
      }
      if (!angular.isDefined($scope.filter.logLevelExactMatch)) {
        $scope.filter.logLevelExactMatch = false;
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

    $scope.init();

    $scope.toTime = 0;
    $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};


    $scope.logLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];
    $scope.logLevelMap = {};

    angular.forEach($scope.logLevels, (name, idx) => {
      $scope.logLevelMap[name] = idx;
      $scope.logLevelMap[name.toLowerCase()] = idx;
    });

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
      var uri =  "https://access.redhat.com/knowledge/solutions"
      var expanded = $scope.logs.filter((log) => { return log.expanded; });
      if (expanded.length > 0) {
        // guess we'll take the most recent expanded event
        var last = expanded.last();
        var text = last.message;
        var logger = last.logger;
        uri = uri + "?logger=" + logger + "&text=" + text;
      }
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


    $scope.filterLogMessage = (log) => {

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
      var scrollToBottom = false;
      if (!$scope.inDashboard) {
        var window = $($window);

        if ($scope.logs.length === 0) {
          // initial page load, let's scroll to the bottom
          scrollToBottom = true;
        }

        if ( (window.scrollTop() + window.height()) > (Core.getDocHeight() - 100) ) {
          // page is scrolled near the bottom
          scrollToBottom = true;
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

  }
}
