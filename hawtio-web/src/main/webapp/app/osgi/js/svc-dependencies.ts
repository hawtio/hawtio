module Osgi {

    export function ServiceDependencyController($scope, $routeParams, workspace:Workspace, osgiDataService: OsgiDataService) {

        $scope.init = () => {

            if ($routeParams["bundleFilter"]) {
                $scope = $routeParams["bundleFilter"];
            } else {
                $scope.bundleFilter = "";
            }

            if ($routeParams["pkgFilter"]) {
                $scope.packageFilter = $routeParams["pkgFilter"];
            } else {
                $scope.packageFilter = "";
            }

            if ($routeParams["view"] == "packages") {
                $scope.selectView = "packages";
            } else {
                $scope.selectView = "services";
            }

            if ($routeParams['hideUnused']) {
                $scope.hideUnused = $routeParams['hideUnused'] == "true";
            } else {
                $scope.hideUnused = true;
            }

            $scope.updatePkgFilter();
        }

        $scope.addToDashboardLink = () => {

            var routeParams = angular.toJson($routeParams);

            var href="#/osgi/dependencies";
            var title="OSGi Dependencies";

            var size = angular.toJson({
                size_x: 2,
                size_y: 2
            });
            return "#/dashboard/add?tab=dashboard" +
                "&href=" + encodeURIComponent(href) +
                "&routeParams=" + encodeURIComponent(routeParams) +
                "&size=" + encodeURIComponent(size) +
                "&title=" + encodeURIComponent(title);
        };

        $scope.$on('$routeUpdate', () => {
            $scope.init();
            $scope.updateGraph();
        });

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

        $scope.init();
        $scope.updateGraph();
    }
}
