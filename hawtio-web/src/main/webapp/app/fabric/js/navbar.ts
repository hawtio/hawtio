module Fabric {
  export function NavBarController($scope, $location, jolokia, workspace:Workspace) {

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };

    $scope.clusterLink = () => {
      // TODO move to use /fabric/clusters by default maybe?
      return Core.createHref($location, "#/fabric/clusters/fabric/registry/clusters", ["cv", "cp", "pv"]);
    };

    $scope.$on('jmxTreeUpdated', function () {
      reloadData();
    });

    reloadData();

    function reloadData() {
      var containerId = null;
      Fabric.containerWebAppURL(jolokia, "org.fusesource.insight.insight-kibana3", containerId, onKibanaUrl, onKibanaUrl);
      Fabric.containerWebAppURL(jolokia, "drools-wb-distribution-wars", containerId, onDroolsUrl, onDroolsUrl);
      $scope.hasMetrics = workspace.treeContainsDomainAndProperties('org.elasticsearch', {service: 'restjmx'});
      $scope.canUpload = workspace.treeContainsDomainAndProperties('io.hawt.jmx', {type: 'UploadManager'});
      var ensembleContainers = jolokia.getAttribute(Fabric.clusterManagerMBean, "EnsembleContainers");
      if (!ensembleContainers || ensembleContainers.length == 0) {
        $scope.hasFabric = false;
      } else {
        $scope.hasFabric = true;
      }
      if (!$scope.hasFabric) {
        $location.url("/fabric/create");
      }
    }

    function onKibanaUrl(response) {
      var url = response ? response.value : null;
      console.log("========== onKibanaUrl: " + url);
      $scope.kibanaHref = url;
      Core.$apply($scope);
    }

    function onDroolsUrl(response) {
      var url = response ? response.value : null;
      console.log("========== onDroolsUrl: " + url);
      $scope.droolsHref = url;
      Core.$apply($scope);
    }
  }
}
