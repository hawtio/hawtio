module Fabric {
  export function NavBarController($scope, $location, workspace:Workspace) {

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };

    $scope.clusterLink = () => {
      // TODO move to use /fabric/clusters by default maybe?
      return Core.createHref($location, "#/fabric/clusters/fabric/registry", ["cv", "cp", "pv"]);
    };
  }
}