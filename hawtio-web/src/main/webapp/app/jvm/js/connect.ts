/**
 * @module Jvm
 */
module JVM {
  export function ConnectController($scope, $location, localStorage, workspace) {

    var log:Logging.Logger = Logger.get("JVM");

    JVM.configureScope($scope, $location, workspace);

    $scope.chromeApp = Core.isChromeApp();
    $scope.useProxy = $scope.chromeApp ? false : true;

    // lets load the local storage configuration
    var key = "jvmConnect";

    log.debug("localStorage[jvmConnect]: ", localStorage[key]);

    var config = {};
    var configJson = localStorage[key];
    if (configJson) {
      try {
        config = JSON.parse(configJson);
      } catch (e) {
        delete localStorage[key];
        // ignore
      }
    }

    log.debug("config after pulling out of local storage: ", config);

    if (!('Unnamed' in config)) {
      Core.pathSet(config, ['Unnamed', 'host'], 'localhost');
      Core.pathSet(config, ['Unnamed', 'path'], 'jolokia');
      Core.pathSet(config, ['Unnamed', 'port'], '8181');
      Core.pathSet(config, ['Unnamed', 'userName'], '');
      Core.pathSet(config, ['Unnamed', 'password'], '');
    }

    $scope.currentConfig = config['Unnamed'];

    $scope.formConfig = {
      properties: {
        connectionName: {
          type: 'java.lang.String',
          description: 'Name for this connection'
        },
        host: {
          type: 'java.lang.String',
          description: 'Target host to connect to',
          required: true
        },
        port: {
          type: 'java.lang.Integer',
          description: 'The HTTP port used to connect to the server',
          'input-attributes': {
            'min': '0'
          },
          required: true
        },
        path: {
          type: 'java.lang.String',
          description: "The URL path used to connect to Jolokia on the remote server"
        },
        userName: {
          type: 'java.lang.String',
          description: "The user name to be used when connecting to Jolokia"
        },
        password: {
          type: 'password',
          description: 'The password to be used when connecting to Jolokia'
        },
        useProxy: {
          type: 'java.lang.Boolean',
          description: 'Whether or not we should use a proxy to connect to the remote Server',
          'control-attributes': {
            'ng-hide': 'chromeApp'
          }
        }
      },
      type: 'void'
    };

    $scope.$watch('currentConfig', (newValue, oldValue) => {
      if (!newValue) {
        return;
      }
      var config = angular.fromJson(localStorage[key]);
      if (!config) {
        config = {};
      }
      log.debug("Config: ", $scope.currentConfig);
      if (Core.isBlank(newValue['name'])) {
        newValue['name'] = 'Unnamed';
      }
      config[newValue['name']] = newValue;
      localStorage[key] = angular.toJson(config);
    }, true);

    $scope.gotoServer = () => {
      var options:Core.ConnectToServerOptions = new Core.ConnectToServerOptions();
      var host = $scope.currentConfig['host'] || 'localhost';

      // lets trim any http:// prefix or / postfix
      var idx = host.indexOf("://");
      if (idx >= 0) {
        host = host.substring(idx + 3);
      }
      idx = host.indexOf("/");
      if (idx >= 0) {
        host = host.substring(0, idx);
      }

      log.info("using host name: " + host + " and user: " + $scope.userName + " and password: " + ($scope.password ? "********" : $scope.password));
      options.host = host;
      options.port = $scope.currentConfig['port'];
      options.path = $scope.currentConfig['path'];
      options.userName = $scope.currentConfig['userName'];
      options.password = $scope.currentConfig['password'];
      options.useProxy = $scope.currentConfig['useProxy'];

      Core.connectToServer(localStorage, options);
    }
  }
}
