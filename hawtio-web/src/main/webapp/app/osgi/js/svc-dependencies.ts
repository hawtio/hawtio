module Osgi {
    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        $scope.watch(osgiDataService.bundles, function(data) {
          $scope.bundles = data
        })
    }
}