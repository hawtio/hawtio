/**
 *  @module Themes
 */
/// <reference path="./themesPlugin.ts"/>
module Themes {
  _module.controller("Themes.PreferencesController", ["$scope", "localStorage", "branding", ($scope, localStorage, branding) => {

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
  }]);
}
