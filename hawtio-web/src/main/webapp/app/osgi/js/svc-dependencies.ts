module Osgi {
    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        $scope.bundles = osgiDataService.getBundles();
    }
}