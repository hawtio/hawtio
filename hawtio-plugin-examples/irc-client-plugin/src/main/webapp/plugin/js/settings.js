/**
 * @module IRC
 */
var IRC = (function (IRC) {

  /**
   * @method SettingsController
   * @param $scope
   * @param IRCServer
   *
   * Controller that handles the IRC settings page
   */
  IRC.SettingsController = function($scope, IRCService, localStorage) {

    $scope.formEntity = angular.fromJson(localStorage[IRC.SETTINGS_KEY]) || {};
    $scope.formConfig = {
      properties: {
        host: {
          description: "IRC Server Hostname",
          'type': 'java.lang.String',
          required: true
        },
        nickname: {
          description: "IRC Nickname",
          'type': 'java.lang.String',
          required: true
        },
        ports: {
          description: 'IRC Port',
          'type': 'Integer'
        },
        username: {
          description: 'IRC User Name',
          'type': 'java.lang.String'
        },
        password: {
          description: 'IRC Password',
          'type': 'password'
        },
        realname: {
          description: 'Real Name',
          'type': 'java.lang.String'
        },
        useSSL: {
          description: 'SSL',
          'type': 'boolean'
        },
        autostart: {
          description: 'Connect at startup',
          'type': 'boolean'
        }
      }
    };

    $scope.$watch('formEntity', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        localStorage[IRC.SETTINGS_KEY] = angular.toJson(newValue);
      }
    }, true);



  };

  return IRC;
}(IRC || {}));
