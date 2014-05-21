/**
* @module Jmx
*/
module Jmx {

  // IOperationControllerScope
  export function OperationController($scope, workspace:Workspace, jolokia, $document) {
    $scope.title = $scope.item.humanReadable;
    $scope.desc = $scope.item.desc;
    $scope.operationResult = '';
    $scope.executeIcon = "icon-ok";
    $scope.mode = "text";

    var sanitize = (args) => {
      if (args) {
        args.forEach( function (arg) {
          switch (arg.type) {
            case "int":
            case "long":
              arg.formType = "number";
              break;
            default:
              arg.formType = "text";
          }
        });
      }

      return args;
    };

    $scope.args = sanitize($scope.item.args);


    $scope.dump = (data) => {
      console.log(data);
    };


    $scope.ok = () => {
      $scope.operationResult = '';
    };


    $scope.reset = () => {
      if ($scope.item.args) {
        $scope.item.args.forEach( function (arg) {
          arg.value = "";
        });
      }
      $scope.ok();
    };


    $scope.handleResponse = (response) => {
      $scope.executeIcon = "icon-ok";
      $scope.operationStatus = "success";

      if (response === null || 'null' === response) {
        $scope.operationResult = "Operation Succeeded!";
      } else if (typeof response === 'string') {
        $scope.operationResult = response;
      } else {
        $scope.operationResult = angular.toJson(response, true);
      }

      $scope.mode = CodeEditor.detectTextFormat($scope.operationResult);

      Core.$apply($scope);
    };


    $scope.execute = () => {

      var node = workspace.selection;

      if (!node) {
        return;
      }

      var objectName = node.objectName;

      if (!objectName) {
        return;
      }

      var args = [objectName, $scope.item.name];
      if ($scope.item.args) {
        $scope.item.args.forEach( function (arg) {
          args.push(arg.value);
        });
      }

      args.push(onSuccess($scope.handleResponse, {
        error: function (response) {
          $scope.executeIcon = "icon-ok";
          $scope.operationStatus = "error";
          var error = response.error;
          $scope.operationResult = error;
          var stacktrace = response.stacktrace;
          if (stacktrace) {
            $scope.operationResult = stacktrace;
          }
          Core.$apply($scope);
        }
      }));

      $scope.executeIcon = "icon-spinner icon-spin";
      var fn = jolokia.execute;
      fn.apply(jolokia, args);
     };


  }


  export function OperationsController($scope,
                                       workspace:Workspace,
                                       jolokia,
                                       rbacACLMBean) {

    $scope.operations = {};
    $scope.objectName = '';
    $scope.methodFilter = '';
    $scope.workspace = workspace;

    var fetch = Core.throttled(() => {
      log.debug("fetching mbean info for: ", workspace.selection);
      var node = workspace.selection;
      if (!node) {
        return;
      }

      $scope.objectName = node.objectName;
      if (!$scope.objectName) {
        return;
      }

      jolokia.request({
        type: 'list',
        path:  escapeMBeanPath($scope.objectName)
      }, onSuccess(render));
    }, 500);

    function getArgs(args) {
      return "(" + args.map(function(arg) {return arg.type}).join() + ")";
    }

    function sanitize (value) {
      for (var item in value) {
        item = "" + item;
        value[item].name = item;
        value[item].humanReadable = humanizeValue(item);
      }
      return value;
    }

    $scope.isOperationsEmpty = () => {
      return $.isEmptyObject($scope.operations);
    };

    $scope.doFilter = (item) => {
      if (Core.isBlank($scope.methodFilter)) {
        return true;
      }
      if (item.name.toLowerCase().has($scope.methodFilter.toLowerCase())
          || item.humanReadable.toLowerCase().has($scope.methodFilter.toLowerCase())) {
        return true;
      }
      return false;
    };

    $scope.canInvoke = (operation) => {
      if (!('canInvoke' in operation)) {
        return true;
      } else {
        return operation['canInvoke'];
      }
    };

    $scope.getClass = (operation) => {
      if ($scope.canInvoke(operation)) {
        return 'can-invoke';
      } else {
        return 'cant-invoke';
      }
    };

    $scope.$watch('workspace.selection', (newValue, oldValue) => {
      if (!workspace.selection || workspace.moveIfViewInvalid()) {
        return;
      }
      fetch();
    });

    function fetchPermissions(objectName, operations) {
      var map = {};
      map[objectName] = [];

      angular.forEach(operations, (value, key) => {
        map[objectName].push(value.name);
      });

      jolokia.request({
        type: 'exec',
        mbean: rbacACLMBean,
        operation: 'canInvoke(java.util.Map)',
        arguments: [map]
      }, onSuccess((response) => {
        var map = response.value;
        angular.forEach(map[objectName], (value, key) => {
          operations[key]['canInvoke'] = value['CanInvoke'];
        });
        //log.debug("Got operations: ", $scope.operations);
        Core.$apply($scope);
      }, {
        error: (response) => {
          // silently ignore
          Core.$apply($scope);
        }
      }));
    }

    function render(response) {
      var ops = response.value.op;
      var answer = {};

      angular.forEach(ops, function(value, key) {
        if (angular.isArray(value)) {
          angular.forEach(value, function(value, index) {
            answer[key + getArgs(value.args)] = value;
          });
        } else {
          answer[key + getArgs(value.args)] = value;
        }
      });
      $scope.operations = sanitize(answer);
      if (Core.isBlank(rbacACLMBean)) {
        Core.$apply($scope);
        return;
      } else {
        fetchPermissions($scope.objectName, $scope.operations);
      }
    }

  }
}
