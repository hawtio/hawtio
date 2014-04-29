/**
 * @module Fabric
 */
module Fabric {
  export function PreferencesController($scope, localStorage) {
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
  }
}