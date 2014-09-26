/**
 * @module Site
 */
/// <reference path="./sitePlugin.ts"/>
module Site {

  _module.controller("Site.IndexController", ["$scope", "$location", ($scope, $location) => {
    $scope.slideInterval = 5000;
  }]);
}
