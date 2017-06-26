/**
 * @module Diagnostics
 */
/// <reference path="./runtimePlugin.ts"/>
module Runtime {

  _module.controller("Runtime.NavController", ["$scope", "$location", "workspace", ($scope, $location, workspace) => {
    Runtime.configureScope($scope, $location, workspace);
  }]);

}
