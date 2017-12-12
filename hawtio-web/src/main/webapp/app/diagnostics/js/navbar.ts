/**
 * @module Diagnostics
 */
/// <reference path="./diagnosticsPlugin.ts"/>
namespace Diagnostics {

  _module.controller("Diagnostics.NavController", ["$scope", "$location", "workspace", ($scope, $location, workspace) => {
    Diagnostics.configureScope($scope, $location, workspace);
  }]);

}
