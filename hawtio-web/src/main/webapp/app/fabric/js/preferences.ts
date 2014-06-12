/**
 * @module Fabric
 */
/// <reference path="fabricPlugin.ts"/>
module Fabric {
  _module.controller("Fabric.PreferencesController", ["$scope", "localStorage", ($scope, localStorage) => {
    Core.initPreferenceScope($scope, localStorage, {
      'fabricAlwaysPrompt': {
        'value': false,
        'converter': Core.parseBooleanValue
      },
      'fabricEnableMaps': {
        'value': true,
        'converter': Core.parseBooleanValue
      },
      'fabricVerboseNotifications': {
        'value': true,
        'converter': Core.parseBooleanValue
      }
    });
  }]);
}
