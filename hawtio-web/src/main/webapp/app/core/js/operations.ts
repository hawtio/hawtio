function OperationController($scope, $routeParams, workspace:Workspace) {
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

    var args = [objectName, $scope.item.name];
    if ($scope.item.args) {
      $scope.item.args.forEach( function (arg) {
        args.push(arg.value);
      });
    }
    args.push(onSuccess(get_response));

    var fn = jolokia.execute;
    fn.apply(jolokia, args);
  };

}

function OperationsController($scope, $routeParams, workspace:Workspace, $rootScope) {
  $scope.routeParams = $routeParams;
  $scope.workspace = workspace;

  $scope.sanitize = (value) => {
    for (var item in value) {
      value["" + item].name = "" + item;
      value["" + item].humanReadable = humanizeValue("" + item);
    }
    return value;
  };

  var asQuery = (node) => {
    return {
      type: "LIST",
      method: "post",
      path: encodeMBeanPath(node),
      ignoreErrors: true
    };
  };

  $scope.$watch('workspace.selection', function() {
    if (workspace.moveIfViewInvalid()) return;

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
      $scope.operations = $scope.sanitize(response.value.op);
      $scope.$apply()
    };
    jolokia.request(query, onSuccess(update_values));

  });
}
