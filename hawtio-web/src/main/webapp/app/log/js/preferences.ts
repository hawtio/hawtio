/**
 * @module Logs
 */
 module Logs {
  export function PreferencesController($scope, localStorage) {
    Core.initPreferenceScope($scope, localStorage, {
      'logCacheSize': {
        'value': 1000,
        'converter': parseInt
      },
      'logSortAsc': {
        'value': true,
        'converter': Core.parseBooleanValue
      },
      'logAutoScroll': {
        'value': true,
        'converter': Core.parseBooleanValue
      }
    });

  };
 }