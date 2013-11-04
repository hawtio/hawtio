module Camel {
  export function SendMessageController($scope, workspace:Workspace, localStorage, $location) {

    $scope.noCredentials = false;

    if ($location.path().has('activemq')) {
      if (!localStorage['activemqUserName'] || !localStorage['activemqPassword']) {
        $scope.noCredentials = true;
      }
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
    };

    // lets add a default header
    $scope.addHeader();

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

    // if the current JMX selection does not support sending messages then lets redirect the page
    $scope.$watch('workspace.selection', function () {
      workspace.moveIfViewInvalid();
    });

    /** save the sourceFormat in preferences for later
     * Note, this would be controller specific preferences and not the global, overriding, preferences */
      // TODO Use ng-selected="changeSourceFormat()" - Although it seemed to fire multiple times..
    $scope.$watch('codeMirrorOptions.mode.name', function (newValue, oldValue) {
      workspace.setLocalStorage(LANGUAGE_FORMAT_PREFERENCE, newValue)
    });

    var sendWorked = () => {
      $scope.message = "";
      notification("success", "Message sent!");
    };

    $scope.autoFormat = () => {
      setTimeout(() => {
        CodeEditor.autoFormatEditor($scope.codeMirror);
      }, 50);
    };

    $scope.sendMessage = () => {
      var body = $scope.message;
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
            console.log("About to send headers: " + JSON.stringify(headers));
          }

          var jolokia = workspace.jolokia;
          // if camel then use a different operation on the camel context mbean
          var callback = onSuccess(sendWorked);
          if (selection.domain === "org.apache.camel") {
            var uri = selection.title.replace("\\?", "?");
            mbean = getSelectionCamelContextMBean(workspace);
            if (mbean) {
              if (headers) {
                jolokia.execute(mbean, "sendBodyAndHeaders(java.lang.String, java.lang.Object, java.util.Map)", uri, body, headers, callback);
              } else {
                jolokia.execute(mbean, "sendStringBody(java.lang.String, java.lang.String)", uri, body, callback);
              }
            } else {
              notification("error", "Could not find CamelContext MBean!");
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
    };

    function isCamelEndpoint() {
      // TODO check for the camel or if its an activemq endpoint
      return true;
    }

    function isJmsEndpoint() {
      // TODO check for the jms/activemq endpoint in camel or if its an activemq endpoint
      return true;
    }
  }
}
