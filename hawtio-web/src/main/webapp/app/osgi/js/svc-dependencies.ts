module Osgi {

    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        $scope.bundleFilter  = "";
        $scope.packageFilter = "";
        $scope.selectView    = "services";
        $scope.hideUnused    = true;
        $scope.disablePkg    = true;

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
              $scope.selectView == "services",
              $scope.selectView == "packages",
              $scope.hideUnused
            );

            $scope.graph = graphBuilder.buildGraph();
            Core.$apply($scope);
        };

        $scope.updatePkgFilter = () => {
            if ($scope.packageFilter == null || $scope.packageFilter == "") {
                $scope.selectView = "services";
                $scope.disablePkg = true;
            } else {
                $scope.disablePkg = false;
            }
        }

        $scope.updateGraph();
    }
}
