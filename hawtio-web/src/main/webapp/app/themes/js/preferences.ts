/**
 *  @module Themes
 */
module Themes {
  export function PreferencesController($scope, localStorage, branding) {

    $scope.availableThemes = Themes.getAvailableThemes();
    $scope.availableBrandings = Themes.getAvailableBrandings();

    Core.initPreferenceScope($scope, localStorage, {
      'theme': {
        'value': Themes.currentTheme,
        'override': (newValue, oldValue) => {
          if (newValue !== oldValue) {
            Themes.setTheme(newValue, branding);
          }
        }
      },
      'branding': {
        'value': Themes.currentBranding,
        'override': (newValue, oldValue) => {
          if (newValue !== oldValue) {
            Themes.setBranding(newValue, branding);
          }
        }
      }
    });
  }
}
