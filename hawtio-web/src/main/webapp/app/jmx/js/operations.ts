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
    export function OperationController($scope, workspace:Workspace, $document) {
      $scope.title = $scope.item.humanReadable;
      $scope.desc = $scope.item.desc;

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

      $scope.execute = (args) => {
        var node = $scope.workspace.selection;

        if (!node) {
          return;
        }

        var objectName = node.objectName;

        if (!objectName) {
          return;
        }

        var jolokia = workspace.jolokia;

        var get_response = (response) => {

          // TODO - for now, really want to replace contents of form with operation result.
          if (response === null || 'null' === response) {
            notification('success', "Operation succeeded!");
          } else {
            notification('success', "Operation succeeded with result: " + JSON.stringify(response));
          }

          $scope.$apply();
        };

        // TODO Needs a different name, javascript vars don't work like this
        var args = [objectName, $scope.item.name];
        if ($scope.item.args) {
          $scope.item.args.forEach( function (arg) {
            args.push(arg.value);
          });
        }

        // TODO - for now, really want to replace contents of form with operation result.
        args.push(onSuccess(get_response, {
          error: function (response) {
            notification('error', 'Operation failed: ' + response.error);
          }
        }));

        // TODO Use angular apply
          // angular.bind(jolokia, jolokia.execute, args)();
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

        // TODO Why do we bind the workspace to the $scope if we have access to it from closures? Is it to share state across controllers maybe?
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
        workspace.jolokia.request(query, onSuccess(update_values));

      });
    }
};
