/**
 * @module ActiveMQ
 */
/// <reference path="activemqPlugin.ts"/>
/// <reference path="../../core/js/preferenceHelpers.ts"/>
module ActiveMQ {
  _module.controller("ActiveMQ.PreferencesController", ["$scope", "localStorage", "userDetails", "$rootScope", (
      $scope,
      localStorage: WindowLocalStorage,
      userDetails: Core.UserDetails,
      $rootScope: ng.IRootScopeService) => {

    Core.initPreferenceScope($scope, localStorage, {
        'activemqUserName': {
          'value': userDetails.username,
        },
        'activemqPassword': {
          'value': userDetails.password
        },
        'activemqBrowseBytesMessages': {
          'value': 1,
          'converter': parseInt,
          'formatter': (value) => { return "" + value }
        },
        'activemqFilterAdvisoryTopics': {
          'value': false,
          'converter': Core.parseBooleanValue,
          'post': (newValue) => {
            $rootScope.$broadcast('jmxTreeUpdated');
          }
        }
      });

  }]);
}
