/**
 *  @module Themes
 */
module Themes {
  export function PreferencesController($scope, localStorage, branding) {

    $scope.availableThemes = Themes.getAvailable();

    Core.initPreferenceScope($scope, localStorage, {
      'currentTheme': {
        'value': Themes.current,
        'override': (newValue, oldValue) => {
          if (newValue !== oldValue) {
            Themes.setTheme(newValue, branding);
          }
        }
      }  
    });
  }
}