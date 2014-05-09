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


    export function OperationsController($scope, $routeParams, workspace:Workspace, jolokia) {

      $scope.operations = {};
      $scope.methodFilter = '';

      var sanitize = (value) => {
        for (var item in value) {
          item = "" + item;
          value[item].name = item;
          value[item].humanReadable = humanizeValue(item);
        }
        return value;
      };

      var asQuery = (node) => {
        var path = escapeMBeanPath(node);
        var query = {
          type: "LIST",
          method: "post",
          path: path,
          ignoreErrors: true
        };
        return query;
      };

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

      $scope.$on("$routeChangeSuccess", function (event, current, previous) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(render, 50);
      });

      $scope.$watch('workspace.selection', function () {
        if (workspace.moveIfViewInvalid()) return;
        render();
      });

      function render() {
        var node = workspace.selection;
        if (!node) {
          return;
        }

        var objectName = node.objectName;
        if (!objectName) {
          return;
        }

        var query = asQuery(objectName);

        var update_values = (response) => {
          var ops = response.value.op;

          var answer = {};

          var getArgs = function (args) {
            return "(" + args.map(function(arg) {return arg.type}).join() + ")";
          };

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
          Core.$apply($scope);
        };

        jolokia.request(query, onSuccess(update_values, {
          error: function(response) {
            notification('error', 'Failed to query available operations: ' + response.error);
          }
        }));
      }

      render();

    }
}
