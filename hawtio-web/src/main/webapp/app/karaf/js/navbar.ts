module Karaf {

  export function NavBarController($scope, workspace:Workspace) {

    $scope.isKarafEnabled = workspace.treeContainsDomainAndProperties("org.apache.karaf")
    $scope.isFeaturesEnabled = Karaf.getSelectionFeaturesMBean(workspace);
    $scope.isScrEnabled = Karaf.getSelectionScrMBean(workspace);


    $scope.isActive = (nav) => {
      return workspace.isLinkActive(nav);
    };
  }
}
