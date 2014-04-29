/**
 * @module Core
 */
module Core {

  export function PreferencesController($scope, $location, workspace, preferencesRegistry, $element) {

    Core.bindModelToSearchParam($scope, $location, "pref", "pref", "Core");
    $scope.panels = {}

    $scope.$watch(() => { return $element.is(':visible'); }, (newValue, oldValue) => {
      if (newValue) {
        setTimeout(() => {
          $scope.panels = preferencesRegistry.getTabs();
          log.debug("Panels: ", $scope.panels);
          Core.$apply($scope);
        }, 50);
      }
    });
  }
}
