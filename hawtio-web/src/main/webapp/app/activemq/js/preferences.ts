/**
 * @module ActiveMQ
 */
module ActiveMQ {
  export function PreferencesController($scope, localStorage, userDetails, $rootScope) {

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

  }
}