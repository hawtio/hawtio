/**
 * @module Core
 */
module Core {

  export function PreferencesController($scope, $location, workspace, preferencesRegistry) {

    $scope.workspace = workspace;
    $scope.registry = preferencesRegistry;
    $scope.localStorage = localStorage;
    Core.bindModelToSearchParam($scope, $location, "pref", "pref", "Core");

  }
}
