module Camel {
    export function SendMessageController($scope, workspace:Workspace) {
      var LANGUAGE_FORMAT_PREFERENCE = "defaultLanguageFormat";
      var sourceFormat = workspace.getLocalStorage(LANGUAGE_FORMAT_PREFERENCE) || "javascript";
      $scope.message = "";
      // TODO Remove this if possible
      $scope.codeMirror = undefined;
      var options = {
        mode: {
            name: sourceFormat
        },
        // Quick hack to get the codeMirror instance.
        onChange: function(codeMirror) {
          if(!$scope.codeMirror) {
            $scope.codeMirror = codeMirror;
          }
        }
      };
      $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

      // TODO Find out what this does
      $scope.$watch('workspace.selection', function () {
        workspace.moveIfViewInvalid();
      });

      /** save the sourceFormat in preferences for later
       * Note, this would be controller specific preferences and not the global, overriding, preferences */
      // TODO Use ng-selected="changeSourceFormat()" - Although it seemed to fire multiple times..
      $scope.$watch('codeMirrorOptions.mode.name', function(newValue, oldValue) {
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
            var jolokia = workspace.jolokia;
            // if camel then use a different operation on the camel context mbean
            if (selection.domain === "org.apache.camel") {
              var uri = selection.title;
              mbean = getSelectionCamelContextMBean(workspace);
              if (mbean) {
                jolokia.execute(mbean, "sendStringBody(java.lang.String,java.lang.String)", uri, body, onSuccess(sendWorked));
              } else {
                notification("error", "Could not find CamelContext MBean!");
              }
            } else {
              jolokia.execute(mbean, "sendTextMessage(java.lang.String)", body, onSuccess(sendWorked));
            }
          }
        }
      };
    }
}