/**
 * @module JVM
 */
/// <reference path="./jvmPlugin.ts"/>
module JVM {

  _module.controller("JVM.NavController", ["$scope", "$location", "workspace", ($scope, $location, workspace) => {
    JVM.configureScope($scope, $location, workspace);
  }]);

}
