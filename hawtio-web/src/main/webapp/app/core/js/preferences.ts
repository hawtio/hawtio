/**
 * @module Core
 */
module Core {

  export function PreferencesController($scope, $location, jolokia, workspace, localStorage, userDetails, jolokiaUrl, branding, preferencesRegistry) {

    $scope.workspace = workspace;
    $scope.registry = preferencesRegistry;
    $scope.localStorage = localStorage;
    Core.bindModelToSearchParam($scope, $location, "pref", "pref", "core-preference");

  }
}
