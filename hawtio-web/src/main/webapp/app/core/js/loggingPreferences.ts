/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
/// <reference path="preferenceHelpers.ts"/>
module Core {

  _module.controller("Core.LoggingPreferences", ["$scope", ($scope) => {
    Core.initPreferenceScope($scope, localStorage, {
      'logBuffer': {
        'value': 100,
        'converter': parseInt,
        'formatter': parseInt,
        'post': (newValue) => {
          window['LogBuffer'] = newValue;
        }  
      },
      'logLevel': {
        'value': '{"value": 2, "name": "INFO"}',
        'post': (value) => {
          var level = angular.fromJson(value);
          Logger.setLevel(level);
        }
      }
    });
  }]);
}
