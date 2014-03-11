/**
 * @module JVM
 */
module JVM {
  export function ConnectController($scope, $location, localStorage, workspace) {

    JVM.configureScope($scope, $location, workspace);

    $scope.forms = {};

    $scope.chromeApp = Core.isChromeApp();
    $scope.useProxy = $scope.chromeApp ? false : true;

    $scope.settings = {
      last: 1,
      lastConnection: ''
    };

    // load settings like current tab, last used connection
    if (connectControllerKey in localStorage) {
      try {
        $scope.settings = angular.fromJson(localStorage[connectControllerKey]);
      } catch (e) {
        // corrupt config
        delete localStorage[connectControllerKey];
      }
    }

    // load connection settings
    // TODO add known default configurations here...
    $scope.connectionConfigs = {

    };



    if (connectionSettingsKey in localStorage) {
      try {
        $scope.connectionConfigs = angular.fromJson(localStorage[connectionSettingsKey]);
      } catch (e) {
        // corrupt config
        delete localStorage[connectionSettingsKey];
      }
    }

    /*
    log.debug("Controller settings: ", $scope.settings);
    log.debug("Current config: ", $scope.currentConfig);
    log.debug("All connection settings: ", $scope.connectionConfigs);
    */

    $scope.formConfig = {
      properties: {
        connectionName: {
          type: 'java.lang.String',
          description: 'Name for this connection',
          'input-attributes': {
            'placeholder': 'Unnamed...'
          }
        },
        scheme: {
          type: 'java.lang.String',
          description: 'HTTP or HTTPS',
          required: true
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

    function newConfig() {
      var answer = {
        scheme: 'http',
        host: 'localhost',
        path: 'jolokia',
        port: '8181',
        userName: '',
        password: ''
      };

      if ($scope.chromeApp) {
        answer['useProxy'] = false;
      } else {
        answer['useProxy'] = true;
      }
      return answer;
    }

    $scope.clearSettings = () => {
      delete localStorage[connectControllerKey];
      delete localStorage[connectionSettingsKey];
      window.location.reload();
    };

    $scope.newConnection = () => {
      $scope.settings.lastConnection = '';
    };

    $scope.deleteConnection = () => {
      Core.removeRegex($scope.settings.lastConnection);
      delete $scope.connectionConfigs[$scope.settings.lastConnection];
      var tmp = Object.extended($scope.connectionConfigs);
      if (tmp.size() === 0) {
        $scope.settings.lastConnection = '';
      } else {
        $scope.settings.lastConnection = tmp.keys().first();
      }
      localStorage[connectionSettingsKey] = angular.toJson($scope.connectionConfigs);
    };

    $scope.$watch('settings', (newValue, oldValue) => {

      if (Core.isBlank($scope.settings['lastConnection'])) {
        $scope.currentConfig = newConfig();
      } else {
        $scope.currentConfig = Object.extended($scope.connectionConfigs[$scope.settings['lastConnection']]).clone();
      }

      if (newValue !== oldValue) {
        localStorage[connectControllerKey] = angular.toJson(newValue);
      }
    }, true);


    $scope.save = () => {
      $scope.gotoServer($scope.currentConfig, null, true);
    };

    $scope.gotoServer = (json, form, saveOnly) => {

      if (json) {

        var jsonCloned = Object.extended(json).clone(true);

        log.debug("json: ", jsonCloned);

        // new connection created via the form, let's save it
        var connectionName = jsonCloned['connectionName'];
        if (Core.isBlank(connectionName)) {
          connectionName = "Unnamed" + $scope.settings.last++;
          jsonCloned['connectionName'] = connectionName
        }

        var regexs = Core.getRegexs();

        var hasFunc = (r) => { return r['name'] === $scope.settings.lastConnection };

        if ($scope.settings.lastConnection !== connectionName && !Core.isBlank($scope.settings.lastConnection)) {
          //we're updating an existing connection...
          delete $scope.connectionConfigs[$scope.settings.lastConnection];
          // clean up any similarly named regex
          regexs = regexs.exclude(hasFunc);
        }

        $scope.connectionConfigs[connectionName] = jsonCloned;
        localStorage[connectionSettingsKey] = angular.toJson($scope.connectionConfigs);
        if (regexs && !regexs.any(hasFunc)) {
          Core.storeConnectionRegex(regexs, connectionName, jsonCloned);
        }

        // let's default to saved connections now that we've a new connection
        $scope.currentConfig = jsonCloned;
        $scope.settings.lastConnection = connectionName;
      }

      if (saveOnly === true) {
        Core.$apply($scope);
        return;
      }

      var options:Core.ConnectToServerOptions = new Core.ConnectToServerOptions();
      var host = $scope.currentConfig['host'] || 'localhost';

      log.info("using scheme: " + $scope.currentConfig['scheme'] + " and host name: " + host +
        " and user: " + $scope.currentConfig['userName'] + " and password: " + ($scope.currentConfig['password'] ? "********" : $scope.currentConfig['password']));
      options.scheme = $scope.currentConfig['scheme'];
      options.host = host;
      options.port = $scope.currentConfig['port'];
      options.path = $scope.currentConfig['path'];
      options.userName = $scope.currentConfig['userName'];
      options.password = $scope.currentConfig['password'];
      options.useProxy = $scope.currentConfig['useProxy'];

      Core.$apply($scope);

      Core.connectToServer(localStorage, options);
    };

    function init() {
      log.debug("Initializing")
      var schemeEnum = ['http', 'https'];
      Core.pathSet($scope.formConfig, ['properties', 'scheme', 'enum'], schemeEnum);
    }

    init();
  }
}
