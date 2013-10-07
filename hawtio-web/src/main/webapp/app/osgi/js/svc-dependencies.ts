module Osgi {

    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        $scope.bundleFilter  = "";
        $scope.packageFilter = "";
        $scope.showServices  = true;
        $scope.showPackages  = false;
        $scope.hideUnused    = false;

        $scope.addToDashboardLink = () => {
          var href="#/osgi/dependencies";
          var title="OSGi Dependencies";
          var size = angular.toJson({
            size_x: 2,
            size_y: 2
          });
          return "#/dashboard/add?tab=dashboard" +
              "&href=" + encodeURIComponent(href) +
              "&size=" + encodeURIComponent(size) +
              "&title=" + encodeURIComponent(title);
        };

        $scope.updateGraph = () => {

            var graphBuilder = new OsgiGraphBuilder(
              osgiDataService,
              $scope.bundleFilter,
              $scope.packageFilter,
              $scope.showServices,
              $scope.showPackages,
              $scope.hideUnused
            );

            $scope.graph = graphBuilder.buildGraph();
            Core.$apply($scope);
        };

        $scope.updateGraph();
    }
}
