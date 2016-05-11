/**
 * @module Camel
 */
/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.PreferencesController", ["$scope", "localStorage", ($scope, localStorage) => {
    Core.initPreferenceScope($scope, localStorage, {
      'camelIgnoreIdForLabel': {
        'value': false,
        'converter': Core.parseBooleanValue,
        'post': (newValue) => {
          $scope.$emit('ignoreIdForLabel', newValue);
        }
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
      },
      'camelHideOptionDocumentation': {
        'value': Camel.defaultHideOptionDocumentation,
        'converter': Core.parseBooleanValue,
        'post': (newValue) => {
          $scope.$emit('hideOptionDocumentation', newValue);
        }
      },
      'camelHideOptionDefaultValue': {
        'value': Camel.defaultHideOptionDefaultValue,
        'converter': Core.parseBooleanValue,
        'post': (newValue) => {
          $scope.$emit('hideOptionDefaultValue', newValue);
        }
      },
      'camelHideOptionUnusedValue': {
        'value': Camel.defaultHideOptionUnusedValue,
        'converter': Core.parseBooleanValue,
        'post': (newValue) => {
          $scope.$emit('hideOptionUnusedValue', newValue);
        }
      }
    });
  }]);
}
