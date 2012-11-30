function BrokerStatusController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;

  $scope.$watch('workspace.selection', function () {
    workspace.moveIfViewInvalid();
  });
}
