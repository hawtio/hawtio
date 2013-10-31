module Karaf {

  export function NavBarController($scope, workspace:Workspace) {

    $scope.hash = workspace.hash();

    $scope.isKarafEnabled = workspace.treeContainsDomainAndProperties("org.apache.karaf")
    $scope.isFeaturesEnabled = Karaf.getSelectionFeaturesMBean(workspace);
    $scope.isScrEnabled = Karaf.getSelectionScrMBean(workspace);

    $scope.$on('$routeChangeSuccess', () => {
      $scope.hash = workspace.hash();
    });

    $scope.isActive = (nav) => {
      return workspace.isLinkActive(nav);
    };
  }
}
