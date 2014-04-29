/**
 * @module Core
 */
module Core {
  export function LoggingPreferences($scope) {
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

  }
}