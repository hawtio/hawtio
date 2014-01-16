/**
 * @module Threads
 */
module Threads {

  export function ThreadsController($scope, $routeParams, workspace:Workspace, jolokia) {

    $scope.allThreadIdsResponseJson = '';
    $scope.getThreadInfoResponseJson = '';

    $scope.threads = [];

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
        }
      ]
    };

    $scope.$on('$destroy', () => {
      if ($scope.handle) {
        jolokia.unregister($scope.handle);
        delete $scope.handle;
      }
      if ($scope.threadInfoHandle) {
        jolokia.unregister($scope.threadInfoHandle);
        delete $scope.threadInfoHandle;
      }
    });

    var allThreadIds = {
      type: 'read',
      mbean: Threads.mbean,
      attribute: 'AllThreadIds'
    };

    var getThreadInfo = {
      type: 'exec',
      mbean: Threads.mbean,
      operation: 'getThreadInfo([J)',
      arguments: []
    };

    $scope.init = () => {
      jolokia.request(allThreadIds, onSuccess(getThreadData));
    };

    $scope.registerAllThreadIds = () => {
      return jolokia.register(onSuccess(getThreadData), allThreadIds);
    };

    $scope.registerGetThreadInfo = (ids) => {
      getThreadInfo.arguments = [ids];
      return jolokia.register(onSuccess(render), getThreadInfo);
    };

    $scope.init();

    function getThreadData(response) {
      if (!$scope.handle) {
        $scope.handle = $scope.registerAllThreadIds();
      }
      var responseJson = angular.toJson(response.value, true);
      if ($scope.allThreadIdsResponseJson !== responseJson) {
        $scope.allThreadIdsResponseJson = responseJson;
        if ($scope.threadInfoHandle) {
          jolokia.unregister($scope.threadInfoHandle);
          delete $scope.threadInfoHandle;
        }
        getThreadInfo.arguments = [response.value];
        jolokia.request(getThreadInfo, onSuccess(render));
      }
    }

    function render(response) {
      if (!$scope.threadInfoHandle) {
        var ids = response.value.map((t) => { return t['threadId']; });
        $scope.threadInfoHandle = $scope.registerGetThreadInfo(ids);
      }
      var responseJson = angular.toJson(response.value, true);
      if ($scope.getThreadInfoResponseJson !== responseJson) {
        $scope.getThreadInfoResponseJson = responseJson;

        // sometimes we get a null threadinfo back,
        // lets avoid redrawing in these cases
        var skipRefresh = false;
        response.value.forEach((t) => {
          if (t === null) {
            skipRefresh = true;
          }
        });
        if (skipRefresh) {
          Core.$apply($scope);
          return;
        }

        var threads = response.value.exclude((t) => { return t === null; });
        $scope.threads = threads;
        Core.$apply($scope);
      }
    }


  }

}
