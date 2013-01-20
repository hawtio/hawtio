module Camel {
    export function SendMessageController($scope, workspace:Workspace) {
      var LANGUAGE_FORMAT_PREFERENCE = "defaultLanguageFormat";
      $scope.sourceFormat = workspace.getLocalStorage(LANGUAGE_FORMAT_PREFERENCE) || "javascript";
      $scope.message = "Enter your message to send.";
      var options = {};
      $scope.codeMirrorOptions = createEditorSettings(workspace, $scope.sourceFormat, options);

      // TODO Find out what this does
      $scope.$watch('workspace.selection', function () {
        workspace.moveIfViewInvalid();
      });

      /** save the sourceFormat in preferences for later */
      // TODO Use ng-selected="changeSourceFormat()" - It seemed to fire multiple times though?
      $scope.$watch('codeMirrorOptions.mode', function(newValue, oldValue) {
        workspace.setLocalStorage(LANGUAGE_FORMAT_PREFERENCE, newValue)
      });

      var sendWorked = () => {
        $scope.message = "";
        notification("success", "Message sent!");
      };

      // TODO Re-add this when working
      $scope.autoFormat = () => {
        autoFormatEditor($scope.codeMirror);
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