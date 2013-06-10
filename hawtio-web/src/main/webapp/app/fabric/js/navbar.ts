module Fabric {
  export function NavBarController($scope, $location, jolokia, workspace:Workspace) {

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };

    $scope.clusterLink = () => {
      // TODO move to use /fabric/clusters by default maybe?
      return Core.createHref($location, "#/fabric/clusters/fabric/registry/clusters", ["cv", "cp", "pv"]);
    };

    reloadData();

    function reloadData() {
      var profileId = "kibana";
      var versionId = null;
      Fabric.profileWebAppURL(jolokia, "org.fusesource.insight.insight-kibana3", profileId, versionId, onWebAppUrl, onWebAppUrl);

      $scope.hasMetrics = workspace.treeContainsDomainAndProperties('org.elasticsearch', {service: 'restjmx'});
    }

    function onWebAppUrl(response) {
      var url = response ? response.value : null;
      console.log("========== onWebAppUrl: " + url);
      $scope.kibanaHref = url;
    }
  }
}