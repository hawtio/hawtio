/**
 * @module Camel
 */
module Camel {
  export function PreferencesController($scope, localStorage) {
    Core.initPreferenceScope($scope, localStorage, {
      'camelIgnoreIdForLabel': {
        'value': false,
        'converter': Core.parseBooleanValue
      },
      'camelMaximumLabelWidth': {
        'value': Camel.defaultMaximumLabelWidth,
        'converter': parseInt
      },
      'camelMaximumTraceOrDebugBodyLength': {
        'value': Camel.defaultCamelMaximumTraceOrDebugBodyLength,
        'converter': parseInt
      }
    });

  }
}