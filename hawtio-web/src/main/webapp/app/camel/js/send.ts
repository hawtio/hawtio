/// <reference path="camelPlugin.ts"/>
module Camel {
  _module.controller("Camel.SendMessageController", ["$route", "$scope", "$element", "$timeout", "workspace", "jolokia", "localStorage", "$location", ($route, $scope, $element, $timeout, workspace:Workspace, jolokia, localStorage, $location) => {
    var log:Logging.Logger = Logger.get("Camel");

    log.info("Loaded page!");

    $scope.noCredentials = false;
    $scope.showChoose = false;
    $scope.profileFileNames = [];
    $scope.profileFileNameToProfileId = {};
    $scope.selectedFiles = {};
    $scope.container = {};

    // bind model values to search params...
    Core.bindModelToSearchParam($scope, $location, "tab", "subtab", "compose");
    Core.bindModelToSearchParam($scope, $location, "searchText", "q", "");

    // only reload the page if certain search parameters change
    Core.reloadWhenParametersChange($route, $scope, $location);

    $scope.checkCredentials = () => {
      $scope.noCredentials = (Core.isBlank(localStorage['activemqUserName']) || Core.isBlank(localStorage['activemqPassword']));
    }

    if ($location.path().has('activemq')) {
      $scope.localStorage = localStorage;
      $scope.$watch('localStorage.activemqUserName', $scope.checkCredentials);
      $scope.$watch('localStorage.activemqPassword', $scope.checkCredentials);
    }

    $scope.openPrefs = () => {
      $location.search('pref', 'ActiveMQ');
      $scope.$emit("hawtioOpenPrefs");
    }

    var LANGUAGE_FORMAT_PREFERENCE = "defaultLanguageFormat";
    var sourceFormat = workspace.getLocalStorage(LANGUAGE_FORMAT_PREFERENCE) || "javascript";
    $scope.message = "\n\n\n\n";
    // TODO Remove this if possible
    $scope.codeMirror = undefined;
    var options = {
      mode: {
        name: sourceFormat
      },
      // Quick hack to get the codeMirror instance.
      onChange: function (codeMirror) {
        if (!$scope.codeMirror) {
          $scope.codeMirror = codeMirror;
        }
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.headers = [];

    $scope.addHeader = () => {
      $scope.headers.push({name: "", value: ""});

      // lets set the focus to the last header
      if ($element) {
        $timeout(() => {
          var lastHeader = $element.find("input.headerName").last();
          lastHeader.focus();
        }, 100);
      }
    };

    $scope.removeHeader = (header) => {
      $scope.headers = $scope.headers.remove(header);
    };

    $scope.defaultHeaderNames = () => {
      var answer = [];

      function addHeaderSchema(schema) {
        angular.forEach(schema.definitions.headers.properties, (value, name) => {
          answer.push(name);
        });
      }

      if (isJmsEndpoint()) {
        addHeaderSchema(Camel.jmsHeaderSchema);
      }
      if (isCamelEndpoint()) {
        addHeaderSchema(Camel.camelHeaderSchema);
      }
      return answer;
    };


    $scope.$watch('workspace.selection', function () {
      // if the current JMX selection does not support sending messages then lets redirect the page
      workspace.moveIfViewInvalid();

      if (Fabric.fabricCreated(workspace)) {
        loadProfileConfigurationFiles();
      }
    });

    /* save the sourceFormat in preferences for later
     * Note, this would be controller specific preferences and not the global, overriding, preferences */
      // TODO Use ng-selected="changeSourceFormat()" - Although it seemed to fire multiple times..
    $scope.$watch('codeMirrorOptions.mode.name', function (newValue, oldValue) {
      workspace.setLocalStorage(LANGUAGE_FORMAT_PREFERENCE, newValue)
    });

    var sendWorked = () => {
      $scope.message = "";
      Core.notification("success", "Message sent!");
    };

    $scope.autoFormat = () => {
      setTimeout(() => {
        CodeEditor.autoFormatEditor($scope.codeMirror);
      }, 50);
    };

    $scope.sendMessage = () => {
      var body = $scope.message;
      doSendMessage(body, sendWorked);
    };


    function doSendMessage(body, onSendCompleteFn) {
      var selection = workspace.selection;
      if (selection) {
        var mbean = selection.objectName;
        if (mbean) {
          var headers = null;
          if ($scope.headers.length) {
            headers = {};
            angular.forEach($scope.headers, (object) => {
              var key = object.name;
              if (key) {
                headers[key] = object.value;
              }
            });
            log.info("About to send headers: " + JSON.stringify(headers));
          }

          var callback = onSuccess(onSendCompleteFn);
          if (selection.domain === "org.apache.camel") {
            var target = Camel.getContextAndTargetEndpoint(workspace);
            var uri = target['uri'];
            mbean = target['mbean'];
            if (mbean && uri) {
              if (headers) {
                jolokia.execute(mbean, "sendBodyAndHeaders(java.lang.String, java.lang.Object, java.util.Map)", uri, body, headers, callback);
              } else {
                jolokia.execute(mbean, "sendStringBody(java.lang.String, java.lang.String)", uri, body, callback);
              }
            } else {
              if (!mbean) {
                Core.notification("error", "Could not find CamelContext MBean!");
              } else {
                Core.notification("error", "Failed to determine endpoint name!");
              }
              log.debug("Parsed context and endpoint: ", target);
            }
          } else {
            var user = localStorage["activemqUserName"];
            var pwd = localStorage["activemqPassword"];
            if (headers) {
              jolokia.execute(mbean, "sendTextMessage(java.util.Map, java.lang.String, java.lang.String, java.lang.String)", headers, body, user, pwd, callback);
            } else {
              jolokia.execute(mbean, "sendTextMessage(java.lang.String, java.lang.String, java.lang.String)", body, user, pwd, callback);
            }
          }
        }
      }
    }

    $scope.fileSelection = () => {
      var answer = [];
      angular.forEach($scope.selectedFiles, (value, key) => {
        if (value) {
          answer.push(key);
        }
      });
      return answer;
    };

    $scope.sendSelectedFiles = () => {
      var filesToSend = $scope.fileSelection();
      var fileCount = filesToSend.length;
      var version = $scope.container.versionId || "1.0";

      function onSendFileCompleted(response) {
        if (filesToSend.length) {
          var fileName = filesToSend.pop();
          if (fileName) {
            // lets load the file data...
            var profile = $scope.profileFileNameToProfileId[fileName];
            if (profile) {
              var body = Fabric.getConfigFile(jolokia, version, profile, fileName);
              if (!body) {
                log.warn("No body for message " + fileName);
                body = "";
              }
              doSendMessage(body, onSendFileCompleted);
            }
          }
        } else {
          var text = Core.maybePlural(fileCount, "Message") + " sent!";
          Core.notification("success", text);
        }
      }

      // now lets start sending
      onSendFileCompleted(null);
    };

    function isCamelEndpoint() {
      // TODO check for the camel or if its an activemq endpoint
      return true;
    }

    function isJmsEndpoint() {
      // TODO check for the jms/activemq endpoint in camel or if its an activemq endpoint
      return true;
    }

    function loadProfileConfigurationFiles() {
      if (Fabric.fabricCreated(workspace)) {
        $scope.container = Fabric.getCurrentContainer(jolokia, ['versionId', 'profileIds']);
        jolokia.execute(Fabric.managerMBean, "currentContainerConfigurationFiles", onSuccess(onFabricConfigFiles));
      }
    }

    function onFabricConfigFiles(response) {
      $scope.profileFileNameToProfileId = response;
      // we only want files from the data dir
      $scope.profileFileNames = Object.keys(response).filter(key => {
        return key.toLowerCase().startsWith('data/');
      }).sort();
       $scope.showChoose = $scope.profileFileNames.length ? true : false;
      $scope.selectedFiles = {};
      Core.$apply($scope);
    }
  }]);
}
