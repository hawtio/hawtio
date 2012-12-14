function SendMessageController($scope, workspace:Workspace) {
  var languageFormatPreference = "defaultLanguageFormat";
  $scope.workspace = workspace;
  $scope.sourceFormat = workspace.getLocalStorage(languageFormatPreference) || "javascript";

  var textArea = $("#messageBody").first()[0];
  if (textArea) {
    var options:any = {};
    options.onChange = function(cm) {
      if (cm.getValue() = "") {
        $("#sendButton").attr("disabled", "disabled");
      } else {
        $("#sendButton").removeAttr("disabled");
      }
    };
    var editorSettings = createEditorSettings(workspace, $scope.format, options);
    $scope.codeMirror = CodeMirror.fromTextArea(textArea, editorSettings);
  }

  $scope.$watch('workspace.selection', function () {
    workspace.moveIfViewInvalid();
  });

  $scope.$watch('sourceFormat', function () {
    var format = $scope.sourceFormat;
    var workspace = $scope.workspace;
    if (format && workspace) {
      workspace.setLocalStorage(languageFormatPreference, format);
    }
    var editor = $scope.codeMirror;
    if (editor) {
      editor.setOption("mode", format);
    }
  });

  var sendWorked = () => {
    console.log("Sent message!");
    $("#sendButton").attr("disabled", "disabled");
    $scope.codeMirror.setValue("");
  };

  $scope.autoFormat = () => {
    autoFormatEditor($scope.codeMirror);
  };

  $scope.sendMessage = (body) => {
    var editor = $scope.codeMirror;
    if (editor && !body) {
      body = editor.getValue();
    }
    console.log("sending body: " + body);
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
            console.log("Could not find CamelContext MBean!");
          }
        } else {
          jolokia.execute(mbean, "sendTextMessage(java.lang.String)", body, onSuccess(sendWorked));
        }
      }
    }
  };
}
