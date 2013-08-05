module Karaf {

  export function NavBarController($scope, $location, workspace:Workspace, jolokia) {

    $scope.isFeaturesEnabled = Karaf.getSelectionFeaturesMBean(workspace);
    $scope.isScrEnabled = Karaf.getSelectionScrMBean(workspace);


    $scope.isActive = (nav) => {
      return workspace.isLinkActive(nav);
    };
  }
}