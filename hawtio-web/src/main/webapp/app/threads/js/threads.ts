/**
 * @module Threads
 */
module Threads {

  export function ThreadsController($scope, $routeParams, workspace:Workspace, jolokia) {

    $scope.selectedRowJson = '';

    $scope.lastThreadJson = '';
    $scope.getThreadInfoResponseJson = '';
    $scope.threads = [];
    $scope.totals = {};
    $scope.support = {};

    $scope.row = {};
    $scope.threadSelected = false;
    $scope.selectedRowIndex = -1;

    $scope.showRaw = {
      expanded: false
    };

    $scope.$watch('searchFilter', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.threadGridOptions.filterOptions.filterText = newValue;
      }
    });

    $scope.threadGridOptions = {
      selectedItems: [],
      data: 'threads',
      showSelectionCheckbox: false,
      enableRowClickSelection: true,
      multiSelect: false,
      primaryKeyFn: (entity, idx) => { return entity.threadId; },
      filterOptions: {
        filterText: ''
      },
      sortInfo: {
        sortBy: 'threadId',
        ascending: false
      },
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
          field: 'waitedTime',
          displayName: 'Waited Time(ms)'
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

    $scope.$watch('threadGridOptions.selectedItems', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue.length === 0) {
          $scope.row = {};
          $scope.threadSelected = false;
          $scope.selectedRowIndex = -1;
        } else {
          $scope.row = newValue.first();
          $scope.threadSelected = true;
          $scope.selectedRowIndex = $scope.threads.findIndex($scope.row);
        }
        $scope.selectedRowJson = angular.toJson($scope.row, true);
      }
    }, true);

    $scope.deselect = () => {
      $scope.threadGridOptions.selectedItems = [];
    };

    $scope.selectThreadById = (id) => {
      $scope.threadGridOptions.selectedItems = $scope.threads.find((t) => { return t.threadId === id; });
    };

    $scope.selectThreadByIndex = (idx) => {
      $scope.threadGridOptions.selectedItems = [$scope.threads[idx]];
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

    var initFunc = Core.throttled($scope.init, 500);

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

    function disabledContentionMonitoring(response) {
      log.info("Disabled contention monitoring: ", response);
      Core.$apply($scope);
    }

    function enabledContentionMonitoring(response) {
      $scope.$on('$routeChangeStart', () => {
        jolokia.setAttribute(mbean, 'ThreadContentionMonitoringEnabled', false, onSuccess(disabledContentionMonitoring));
      });
      log.info("Enabled contention monitoring");
      Core.$apply($scope);
    }

    $scope.maybeEnableThreadContentionMonitoring = (response) => {
      if (response.value === false) {
        log.info("Thread contention monitoring not enabled, enabling");
        jolokia.setAttribute(mbean, 'ThreadContentionMonitoringEnabled', true, onSuccess(enabledContentionMonitoring));
      } else {
        log.info("Thread contention monitoring already enabled");
      }
      Core.$apply($scope);
    };

    $scope.getMonitorClass = (name, value) => {
      return value.toString();
    };

    $scope.getMonitorName = (name) => {
      name = name.replace('Supported', '');
      return name.titleize();
    };

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

    initFunc();

  }

}
