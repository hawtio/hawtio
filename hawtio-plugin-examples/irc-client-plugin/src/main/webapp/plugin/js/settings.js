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
  IRC.SettingsController = function($scope, IRCService, localStorage, $location) {

    $scope.connecting = false;

    $scope.forms = {};

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
          'type': 'Integer',
          tooltip: 'Comma separated list of ports to connect to, by default 6667 for non-SSL and 6697 for SSL connections are used'
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
          'type': 'boolean',
          tooltip: 'Whether or not the IRC connection should be started as soon as you log into hawtio'
        },
        channels: {
          description: 'Channels',
          'type': 'java.lang.String',
          tooltip: 'Space separated list of channels to connect to when the IRC connection is started'
        }
      }
    };

    $scope.$watch('formEntity', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        localStorage[IRC.SETTINGS_KEY] = angular.toJson(newValue);
      }
    }, true);

    $scope.buttonText = function() {
      if (IRCService.isConnected()) {
        return "Reconnect";
      } else {
        return "Connect";
      }
    };

    $scope.connect = function() {
      if ($scope.forms.settings.$valid) {
        $scope.connecting = true;
        IRCService.addConnectAction(function() {
          $scope.connecting = false;
          if ($location.path().startsWith("/irc/settings")){
            $location.path("/irc/chat");
          }
        });
        IRCService.connect($scope.formEntity);
      }
    };

  };

  return IRC;
}(IRC || {}));
