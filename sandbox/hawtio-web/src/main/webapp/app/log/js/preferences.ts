/**
 * @module Logs
 */
/// <reference path="./logPlugin.ts"/>
 module Log {
  _module.controller("Log.PreferencesController", ["$scope", "localStorage", ($scope, localStorage) => {
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
      },
      'logBatchSize': {
        'value': 20,
        'converter': parseInt,
        'post': (newValue) => {
          $scope.$emit('logBatchSize', newValue);
        }
      }
    });
  }]);
 }
