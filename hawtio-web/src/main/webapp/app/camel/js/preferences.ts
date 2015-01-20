/**
 * @module Camel
 */
/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.PreferencesController", ["$scope", "localStorage", ($scope, localStorage) => {
    Core.initPreferenceScope($scope, localStorage, {
      'camelIgnoreIdForLabel': {
        'value': false,
        'converter': Core.parseBooleanValue
      },
      'camelShowInflightCounter': {
        'value': true,
        'converter': Core.parseBooleanValue
      },
      'camelMaximumLabelWidth': {
        'value': Camel.defaultMaximumLabelWidth,
        'converter': parseInt
      },
      'camelMaximumTraceOrDebugBodyLength': {
        'value': Camel.defaultCamelMaximumTraceOrDebugBodyLength,
        'converter': parseInt
      },
      'camelTraceOrDebugIncludeStreams': {
        'value': Camel.defaultCamelTraceOrDebugIncludeStreams,
        'converter': Core.parseBooleanValue
      },
      'camelRouteMetricMaxSeconds': {
        'value': Camel.defaultCamelRouteMetricMaxSeconds,
        'converter': parseInt
      }
    });
  }]);
}
