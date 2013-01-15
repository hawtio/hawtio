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
    export function OperationController($scope, $routeParams : ng.IRouteParamsService, workspace:Workspace) {
      $scope.title = $scope.item.humanReadable;
      $scope.desc = $scope.item.desc;
      $scope.routeParams = $routeParams;
      $scope.workspace = workspace;

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
          console.log("Got : " + response);

          // TODO we should render this in the template...
          $scope.operationResult = response;

          // now lets notify the UI to update the tree etc
          $scope.workspace.operationCounter += 1;
          $scope.$apply();
        };

        // TODO Needs a different name, javascript vars don't work like this
        var args = [objectName, $scope.item.name];
        if ($scope.item.args) {
          $scope.item.args.forEach( function (arg) {
            args.push(arg.value);
          });
        }
        args.push(onSuccess(get_response));

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
      $scope.routeParams = $routeParams;
      $scope.workspace = workspace;

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
        var node = $scope.workspace.selection;
        if (!node) {
          return;
        }

        var objectName = node.objectName;
        if (!objectName) {
          return;
        }

        var query = asQuery(objectName);
        var jolokia = workspace.jolokia;

        var update_values = (response) => {
          var ops: IOperation = response.value.op;
          $scope.operations = sanitize(ops);
          $scope.$apply();
        };
        jolokia.request(query, onSuccess(update_values));

      });
    }
};