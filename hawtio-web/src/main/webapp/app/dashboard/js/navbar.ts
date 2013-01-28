module Dashboard {
  export function NavBarController($scope, workspace:Workspace, jolokia) {
    $scope.dashboards = [
      { id: "foo", title: "Foo"},
      { id: "bar", title: "Bar"}
    ];

    $scope.isActive = (dash) => {
      return workspace.isLinkActive("#/dashboard/" + dash.id);
    }
  }
}