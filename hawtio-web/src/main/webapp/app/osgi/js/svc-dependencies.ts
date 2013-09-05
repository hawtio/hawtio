module Osgi {
    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        osgiDataService.register(function() {
          $scope.$apply(function() {
              $scope.bundles = osgiDataService.getBundles();
          });
        });
    }
}