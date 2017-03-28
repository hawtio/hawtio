/// <reference path="corePlugin.ts"/>
/// <reference path="preferenceHelpers.ts"/>

module Core {
  _module.controller("Core.JmxPreferences", ["$scope", "localStorage", ($scope, localStorage) => {

    Core.initPreferenceScope($scope, localStorage, {
      'activemqJmxDomain': {
        'value': "org.apache.activemq"
      },
      'camelJmxDomain': {
        'value': "org.apache.camel"
      },
      'jmxMaxFolderSize': {
        'value': 100,
        'converter': parseInt,
        'formatter': parseInt
      }
      });

  }]);
}
