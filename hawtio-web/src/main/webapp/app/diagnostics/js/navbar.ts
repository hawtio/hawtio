/**
 * @module Diagnostics
 */
/// <reference path="./diagnosticsPlugin.ts"/>
module Diagnostics {

  _module.controller("Diagnostics.NavController", ["$scope", "$location", "workspace", ($scope, $location, workspace) => {
    Diagnostics.configureScope($scope, $location, workspace);
  }]);

}
