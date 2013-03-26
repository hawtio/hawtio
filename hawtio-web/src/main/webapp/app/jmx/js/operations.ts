module Jmx {

    /*
    export interface IArg {
        name : string;
        type : string;
    }

    export interface IOperationControllerScope extends IMyAppScope {
        item : IOperation;
        title : string;
        desc : string;
        args : IArg[];

        execute : (args : IArg[]) => void;
    } */

    // IOperationControllerScope
    export function OperationController($scope, workspace:Workspace, jolokia, $document) {
      $scope.title = $scope.item.humanReadable;
      $scope.desc = $scope.item.desc;
      $scope.operationResult = "";
      $scope.executeIcon = "icon-ok";

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

      $scope.resultIsArray = () => {
        return angular.isArray($scope.operationResult);
      };

      $scope.resultIsString = () => {
        return angular.isString($scope.operationResult);
      };

      $scope.typeOf = (data) => {
        if (angular.isArray(data)) {
          return "array";
        } else if (angular.isObject(data)) {
          return "object";
        } else {
          return "string";
        }
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

        var get_response = (response) => {
          $scope.executeIcon = "icon-ok";
          $scope.operationStatus = "success";

          if (response === null || 'null' === response) {
            $scope.operationResult = "Operation Succeeded!";
          } else {
            if (typeof response === 'number' || typeof response === 'boolean') {
              $scope.operationResult = "" + response;
            } else if (angular.isArray(response) && response.length === 0) {
              $scope.operationResult = "Operation succeeded and returned an empty array";
            } else if (angular.isObject(response) && Object.keys(response).length === 0) {
              $scope.operationResult = "Operation succeeded and returned an empty object";
            } else {
              $scope.operationResult = response;
            }
          }

          $scope.$apply();
        };

        var args = [objectName, $scope.item.name];
        if ($scope.item.args) {
          $scope.item.args.forEach( function (arg) {
            args.push(arg.value);
          });
        }

        args.push(onSuccess(get_response, {
          error: function (response) {
            $scope.executeIcon = "icon-ok";
            $scope.operationStatus = "error";
            var error = response.error;
            $scope.operationResult = error;
            var stacktrace = response.stacktrace;
            if (stacktrace) {
              console.log(stacktrace);
              $scope.operationResult = stacktrace;
            }
          }
        }));

        $scope.executeIcon = "icon-spinner icon-spin";
        var fn = jolokia.execute;
        fn.apply(jolokia, args);
      };

    }

    /*
    export interface IOperation {
        [key : string] : { name : string; humanReadable : string; args : string; };
        [key : string] : any;
    }

    export interface IOperationsControllerScope extends IMyAppScope {
        routeParams : ng.IRouteParamsService;
        workspace : Workspace;
        sanitize : (value : IOperation) => IOperation;
        operations : IOperation;
    }
    */

    export function OperationsController($scope, $routeParams : ng.IRouteParamsService, workspace:Workspace, jolokia) {

      $scope.operations = {};

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
      }

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
          console.log("Operations: ", $scope.operations);
          $scope.$apply();
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
