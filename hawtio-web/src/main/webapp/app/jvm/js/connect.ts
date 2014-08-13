/**
 * @module JVM
 */
/// <reference path="jvmPlugin.ts"/>
/// <reference path="../../core/js/coreInterfaces.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module JVM {
  _module.controller("JVM.ConnectController", ["$scope", "$location", "localStorage", "workspace", ($scope, $location, localStorage, workspace) => {

    JVM.configureScope($scope, $location, workspace);

    $scope.forms = {};

    var hasMBeans = workspace && workspace.tree && workspace.tree.children && workspace.tree.children.length;

    $scope.disableProxy = !hasMBeans || Core.isChromeApp();
    $scope.useProxy = $scope.disableProxy ? false : true;

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
    $scope.connectionConfigs = Core.loadConnectionMap();
    /*
    log.debug("Controller settings: ", $scope.settings);
    log.debug("Current config: ", $scope.currentConfig);
    log.debug("All connection settings: ", $scope.connectionConfigs);
    */

    $scope.formConfig = {
      properties: {
        name: {
          type: 'java.lang.String',
          tooltip: 'Name for this connection',
          'input-attributes': {
            'placeholder': 'Unnamed...'
          }
        },
        scheme: {
          type: 'java.lang.String',
          tooltip: 'HTTP or HTTPS',
          enum: ['http', 'https'],
          required: true
        },
        host: {
          type: 'java.lang.String',
          tooltip: 'Target host to connect to',
          required: true
        },
        port: {
          type: 'java.lang.Integer',
          tooltip: 'The HTTP port used to connect to the server',
          'input-attributes': {
            'min': '0'
          },
          required: true
        },
        path: {
          type: 'java.lang.String',
          tooltip: "The URL path used to connect to Jolokia on the remote server"
        },
        userName: {
          type: 'java.lang.String',
          tooltip: "The user name to be used when connecting to Jolokia"
        },
        password: {
          type: 'password',
          tooltip: 'The password to be used when connecting to Jolokia'
        },
        useProxy: {
          type: 'java.lang.Boolean',
          tooltip: 'Whether or not we should use a proxy. See more information in the panel to the left.',
          'control-attributes': {
            'ng-hide': 'disableProxy'
          }
        }
      },
      type: 'Object'
    };

    function newConfig() {
      return Core.createConnectOptions({
        scheme: 'http',
        host: 'localhost',
        path: 'jolokia',
        port: 8181,
        userName: '',
        password: '',
        useProxy: !$scope.disableProxy
      })
    };

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
      Core.saveConnectionMap($scope.connectionConfigs);
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

    $scope.gotoServer = (json:Core.ConnectOptions, form, saveOnly) => {
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
          if (regexs) {
            regexs = regexs.exclude(hasFunc);
          }
        }
        $scope.connectionConfigs[connectionName] = jsonCloned;
        Core.saveConnectionMap($scope.connectionConfigs);
        if (regexs && !regexs.any(hasFunc)) {
          Core.storeConnectionRegex(regexs, connectionName, jsonCloned);
        }
        // let's default to saved connections now that we've a new connection
        $scope.currentConfig = jsonCloned;
        $scope.settings.lastConnection = connectionName;
      }
      Core.$apply($scope);
      if (saveOnly === true) {
        return;
      }
      Core.connectToServer(localStorage, $scope.currentConfig);
    };

  }]);
}
