/**
 * @module Jclouds
 */
/// <reference path="../jcloudsPlugin.ts"/>
module Jclouds {

    _module.controller("Jclouds.ComputeNavigationController", ["$scope", "$routeParams", "workspace", ($scope, $routeParams, workspace:Workspace) => {
        $scope.computeId = $routeParams.computeId;

        $scope.isActive = (nav) => {
            if (angular.isString(nav))
                return workspace.isLinkActive(nav);
            var fn = nav.isActive;
            if (fn) {
                return fn(workspace);
            }
            return workspace.isLinkActive(nav.href());
        };

    }]);
}
