/**
 * @module Jclouds
 */
module Jclouds {

    export function BlobstoreNavigationController($scope, $routeParams, workspace:Workspace) {
        $scope.blobstoreId = $routeParams.blobstoreId;

        $scope.isActive = (nav) => {
            if (angular.isString(nav))
                return workspace.isLinkActive(nav);
            var fn = nav.isActive;
            if (fn) {
                return fn(workspace);
            }
            return workspace.isLinkActive(nav.href());
        };

    }
}
