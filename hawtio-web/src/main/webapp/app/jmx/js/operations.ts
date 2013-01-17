module Jmx {
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
    }

    // IOperationControllerScope
    export function OperationController($scope, workspace:Workspace, jolokia, $document) {
      $scope.title = $scope.item.humanReadable;
      $scope.desc = $scope.item.desc;
      $scope.operationResult = "";

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
      }

      $scope.reset = () => {

        if ($scope.item.args) {
          $scope.item.args.forEach( function (arg) {
            arg.value = "";
          });
        }

        $scope.operationResult = '';
      }

      $scope.resultIsArray = () => {
        return angular.isArray($scope.operationResult);
      }

      $scope.resultIsString = () => {
        return angular.isString($scope.operationResult);
      }

      $scope.typeOf = (data) => {
        if (angular.isArray(data)) {
          return "array";
        } else if (angular.isObject(data)) {
          return "object";
        } else {
          return "string";
        }
      }

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

          $scope.operationStatus = "success";

          if (response === null || 'null' === response) {
            $scope.operationResult = "Operation Succeeded!";
          } else {
            if (typeof response === 'number' || typeof response === 'boolean') {
              $scope.operationResult = "" + response;
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
            $scope.operationStatus = "error";
            var error = response.error;
            $scope.operationResult = error;
          }
        }));

        var fn = jolokia.execute;
        fn.apply(jolokia, args);
      };

    }

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

    export function OperationsController($scope : IOperationsControllerScope, $routeParams : ng.IRouteParamsService, workspace:Workspace) {

      var sanitize = (value : IOperation) => {
        for (var item in value) {
          item = "" + item;
          value[item].name = item;
          value[item].humanReadable = humanizeValue(item);
        }
        return value;
      };

      var asQuery = (node) => {
        var query = {
          type: "LIST",
          method: "post",
          path: encodeMBeanPath(node),
          ignoreErrors: true
        };
        return query;
      };

      $scope.$watch('workspace.selection', function() {
        if (workspace.moveIfViewInvalid()) return;

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
          var ops: IOperation = response.value.op;
          $scope.operations = sanitize(ops);
          $scope.$apply();
        };

        workspace.jolokia.request(query, onSuccess(update_values, {
          error: function(response) {
            notification('error', 'Failed to query available operations: ' + response.error);
          }
        }));

      });
    }
};
