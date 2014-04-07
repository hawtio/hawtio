/**
 * @module Osgi
 */
module Osgi {

    export function ServiceDependencyController($scope, $location, $routeParams, workspace:Workspace, osgiDataService: OsgiDataService) {

        $scope.init = () => {

            if ($routeParams["bundleFilter"]) {
                $scope.bundleFilter = $routeParams["bundleFilter"];
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

        }

        $scope.updateLink = () => {

            var search = $location.search;

            if ($scope.bundleFilter && $scope.bundleFilter != "") {
                search["bundleFilter"] = $scope.bundleFilter;
            } else {
                delete search["bundleFilter"];
            }

            if ($scope.packageFilter && $scope.packageFilter != "") {
                search["pkgFilter"] = $scope.packageFilter;
            } else {
                delete search["pkgFilter"];
            }

            search["view"] = $scope.selectView;

            if ($scope.hideUnused) {
                search["hideUnused"] = "true";
            } else {
                search["hideUnused"] = "false";
            }

            $location.search(search);
        }

        $scope.addToDashboardLink = () => {

            var routeParams = angular.toJson($routeParams);

            var href="#/osgi/dependencies";
            var title="OSGi dependencies";

            var size = angular.toJson({
                size_x: 2,
                size_y: 2
            });

            var addLink = "#/dashboard/add?tab=dashboard" +
                "&href=" + encodeURIComponent(href) +
                "&routeParams=" + encodeURIComponent(routeParams) +
                "&size=" + encodeURIComponent(size) +
                "&title=" + encodeURIComponent(title);

            return addLink;
        };

        $scope.$on('$routeUpdate', () => {

            var search = $location.search;

            if (search["bundleFilter"]) {
                $scope.bundleFilter = $routeParams["bundleFilter"];
            } else {
                $scope.bundleFilter = "";
            }

            if (search["pkgFilter"]) {
                $scope.packageFilter = $routeParams["pkgFilter"];
            } else {
                $scope.packageFilter = "";
            }

            if (search["view"] == "packages") {
                $scope.selectView = "packages";
            } else {
                $scope.selectView = "services";
            }

            if (search['hideUnused']) {
                $scope.hideUnused = $routeParams['hideUnused'] == "true";
            } else {
                $scope.hideUnused = true;
            }

            $scope.updateLink();
            $scope.updateGraph();
        });

        $scope.updateGraph = () => {

            $scope.updateLink();
            $scope.updatePkgFilter();

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
