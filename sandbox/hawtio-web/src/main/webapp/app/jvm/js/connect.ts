/**
 * @module JVM
 */
/// <reference path="jvmPlugin.ts"/>
/// <reference path="../../core/js/coreInterfaces.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../forms/js/formInterfaces.ts"/>
module JVM {

  interface ScopeSettings {
    lastConnection: string;
  }

  interface ConnectControllerScope extends ng.IScope {
    forms: any;
    disableProxy: boolean;
    lastConnection: string;
    connectionConfigs: Core.ConnectionMap;
    currentConfig: Core.ConnectOptions;
    formConfig: Forms.FormConfiguration;
    newConnection: () => void;
    deleteConnection: () => void;
    save: () => void;
    gotoServer: (options?:Core.ConnectOptions, form?:JQueryStatic, save?:boolean) => void;
  }

  export var ConnectController = _module.controller("JVM.ConnectController", ["$scope", "$location", "localStorage", "workspace", ($scope:ConnectControllerScope, $location:ng.ILocationService, localStorage:WindowLocalStorage, workspace:Core.Workspace) => {

    function newConfig() {
      return Core.createConnectOptions({
        scheme: 'http',
        host: 'localhost',
        path: 'jolokia',
        port: 8181,
        userName: '',
        password: ''
      })
    }

    $scope.forms = {};

    var hasMBeans = workspace && workspace.tree && workspace.tree.children && workspace.tree.children.length;

    $scope.disableProxy = !hasMBeans || Core.isChromeApp();

    $scope.lastConnection = '';

    // load settings like current tab, last used connection
    if (connectControllerKey in localStorage) {
      try {
        $scope.lastConnection = angular.fromJson(localStorage[connectControllerKey]);
      } catch (e) {
        // corrupt config
        $scope.lastConnection = '';
        delete localStorage[connectControllerKey];
      }
    }

    // load connection settings
    $scope.connectionConfigs = Core.loadConnectionMap();
    if (!Core.isBlank($scope.lastConnection)) {
      $scope.currentConfig = $scope.connectionConfigs[$scope.lastConnection];
    } else {
      $scope.currentConfig = newConfig();
    }

    /*
    log.debug("Controller settings: ", $scope.settings);
    log.debug("Current config: ", $scope.currentConfig);
    log.debug("All connection settings: ", $scope.connectionConfigs);
    */

    $scope.formConfig = <Forms.FormConfiguration> {
      properties: <Forms.FormProperties> {
        name: <Forms.FormElement> {
          type: "java.lang.String",
          tooltip: "Name for this connection",
          required: true,
          "input-attributes": {
            "placeholder": "Unnamed..."
          }
        },
        scheme: <Forms.FormElement> {
          type: "java.lang.String",
          tooltip: "HTTP or HTTPS",
          enum: ["http", "https"],
          required: true
        },
        host: <Forms.FormElement> {
          type: "java.lang.String",
          tooltip: "Target host to connect to",
          required: true
        },
        port: <Forms.FormElement> {
          type: "java.lang.Integer",
          tooltip: "The HTTP port used to connect to the server",
          "input-attributes": {
            "min": "0"
          },
          required: true
        },
        path: <Forms.FormElement> {
          type: "java.lang.String",
          tooltip: "The URL path used to connect to Jolokia on the remote server"
        }
      }
    };

    $scope.newConnection = () => {
      $scope.lastConnection = '';
    };

    $scope.deleteConnection = () => {
      delete $scope.connectionConfigs[$scope.lastConnection];
      Core.saveConnectionMap($scope.connectionConfigs);
      var keys = <Array<string>> Object.extended($scope.connectionConfigs).keys();
      if (keys.length === 0) {
        $scope.lastConnection = '';
      } else {
        $scope.lastConnection = keys[0];
      }
    };

    $scope.$watch('lastConnection', (newValue, oldValue) => {
      log.debug("lastConnection: ", newValue);
      if (newValue !== oldValue) {
        if (Core.isBlank(newValue)) {
          $scope.currentConfig = newConfig();
        } else {
          $scope.currentConfig = $scope.connectionConfigs[newValue];
        }
        localStorage[connectControllerKey] = angular.toJson(newValue);
      }
    }, true);

    $scope.save = () => {
      $scope.gotoServer($scope.currentConfig, null, true);
    };

    $scope.gotoServer = (connectOptions?:Core.ConnectOptions, form?, saveOnly?) => {
      if (!connectOptions) {
        connectOptions = Core.getConnectOptions($scope.lastConnection);
      }
      var name = <string> connectOptions.name;
      $scope.connectionConfigs[name] = connectOptions;
      $scope.lastConnection = name;
      if (saveOnly === true) {
        Core.saveConnectionMap($scope.connectionConfigs);
        $scope.connectionConfigs = Core.loadConnectionMap();
        angular.extend($scope.currentConfig, $scope.connectionConfigs[$scope.lastConnection]);
        Core.$apply($scope);
        return;
      }
      // connect to root by default as we do not want to show welcome page
      var view = (connectOptions.view || '#/');
      connectOptions.view = view;
      Core.connectToServer(localStorage, connectOptions);
      $scope.connectionConfigs = Core.loadConnectionMap();
      angular.extend($scope.currentConfig, $scope.connectionConfigs[$scope.lastConnection]);
      Core.$apply($scope);
    };

    var autoconnect = $location.search();
    if (typeof autoconnect != 'undefined' && typeof autoconnect.name != 'undefined') {
      var conOpts = Core.createConnectOptions({
        scheme: ((!autoconnect.scheme) ? 'http' : autoconnect.scheme),
        host: autoconnect.host,
        path: autoconnect.path,
        port: autoconnect.port,
        userName: autoconnect.userName,
        password: autoconnect.password,
        name: autoconnect.name
      });
      $scope.gotoServer(conOpts,null,false);
      window.close();
    }

  }]);
}
