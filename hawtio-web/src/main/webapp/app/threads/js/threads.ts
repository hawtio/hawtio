/**
 * @module Threads
 */
module Threads {

  export function ThreadsController($scope, $routeParams, workspace:Workspace, jolokia) {

    /*
    $scope.objectMonitorUsageSupported = null;
    $scope.synchronizerUsageSupported = null;
    */

    $scope.lastThreadJson = '';
    $scope.getThreadInfoResponseJson = '';
    $scope.threads = [];
    $scope.totals = {};
    $scope.support = {};

    $scope.threadGridOptions = {
      data: 'threads',
      showSelectionCheckbox: false,
      enableRowClickSelection: true,
      multiSelect: false,
      primaryKeyFn: (entity, idx) => { return entity.threadId; },
      columnDefs: [
        {
          field: 'threadId',
          displayName: 'ID'
        },
        {
          field: 'threadState',
          displayName: 'State'
        },
        {
          field: 'threadName',
          displayName: 'Name'
        },
        {
          field: 'blockedTime',
          displayName: 'Blocked Time(ms)'
        },
        {
          field: 'inNative',
          displayName: 'In Native'
        },
        {
          field: 'suspended',
          displayName: 'Is Suspended'
        }
      ]
    };

    $scope.init = () => {

      jolokia.request(
      [{
        type: 'read',
        mbean: Threads.mbean,
        attribute: 'ThreadContentionMonitoringSupported'
      }, {
        type: 'read',
        mbean: Threads.mbean,
        attribute: 'ObjectMonitorUsageSupported'
      }, {
        type: 'read',
        mbean: Threads.mbean,
        attribute: 'SynchronizerUsageSupported'
      }], {
        method: 'post',
        success: [
          (response) => {
            $scope.support.threadContentionMonitoringSupported = response.value;
            log.debug("ThreadContentionMonitoringSupported: ", $scope.support.threadContentionMonitoringSupported);
            $scope.maybeRegister();
          },
          (response) => {
            $scope.support.objectMonitorUsageSupported = response.value;
            log.debug("ObjectMonitorUsageSupported: ", $scope.support.objectMonitorUsageSupported);
            $scope.maybeRegister();
          },
          (response) => {
            $scope.support.synchronizerUsageSupported = response.value;
            log.debug("SynchronizerUsageSupported: ", $scope.support.synchronizerUsageSupported);
            $scope.maybeRegister();
          }],
        error: (response) => {
          log.error('Failed to query for supported usages: ', response.error);
        }
      });
    };

    $scope.maybeRegister = () => {
      if ('objectMonitorUsageSupported' in $scope.support &&
          'synchronizerUsageSupported' in $scope.support &&
          'threadContentionMonitoringSupported' in $scope.support) {
        log.debug("Registering dumpAllThreads polling");
        Core.register(jolokia, $scope, {
          type: 'exec',
          mbean: Threads.mbean,
          operation: 'dumpAllThreads',
          arguments: [$scope.support.objectMonitorUsageSupported, $scope.support.synchronizerUsageSupported]
        }, onSuccess(render));

        if ($scope.support.threadContentionMonitoringSupported) {
          // check and see if it's actually turned on, if not
          // enable it
          jolokia.request({
            type: 'read',
            mbean: Threads.mbean,
            attribute: 'ThreadContentionMonitoringEnabled'
          }, onSuccess($scope.maybeEnableThreadContentionMonitoring));

        }
      }
    };

    function enabledContentionMonitoring(response) {
      log.debug("Enabled contention monitoring: ", response);
    }

    $scope.maybeEnableThreadContentionMonitoring = (response) => {
      if (response.value === false) {
        jolokia.request({
          type: 'write',
          mbean: Threads.mbean,
          attribute: 'ThreadContentionMonitoringEnabled',
          argument: true
        }, onSuccess(enabledContentionMonitoring));
      }
    };

    $scope.getMonitorClass = (name, value) => {
      return value.toString();
    };

    $scope.getMonitorName = (name) => {
      name = name.replace('Supported', '');
      return name.titleize();
    };

    $scope.init();

    function render(response) {
      var responseJson = angular.toJson(response.value, true);
      if ($scope.getThreadInfoResponseJson !== responseJson) {
        $scope.getThreadInfoResponseJson = responseJson;
        var threads = response.value.exclude((t) => { return t === null; });

        $scope.totals = {};
        threads.forEach((t) => {
          // calculate totals
          var state = t.threadState.titleize();
          if (!(state in $scope.totals)) {
            $scope.totals[state] = 1;
          } else {
            $scope.totals[state]++
          }
        });

        $scope.threads = threads;
        $scope.lastThreadJson = angular.toJson($scope.threads.last(), true);
        Core.$apply($scope);
      }
    }


  }

}
