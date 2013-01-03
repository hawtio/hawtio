module Core {
    // TODO would be nice to use a directive instead; but couldn't get it working :(
    export function EditorController($scope, workspace:Workspace) {
      $scope.$watch('row', () => {
        setTimeout(() => {
          var textAreas = null;
          // TODO is there a better way to find the textarea?
          if ($scope.templateDiv) {
            textAreas = $($scope.templateDiv).find("textarea.messageDetail");
          } else {
            textAreas = $("textarea.messageDetail");
          }
          var textArea = textAreas[0];
          if (textArea) {
            if (!$(textArea).data("codeMirrorEditor")) {
              $(textArea).data("codeMirrorEditor", "true");
              var text = $(textArea).val();
              var format = detectTextFormat(text);
              var editorSettings = createEditorSettings(workspace, format, {
                readOnly: true
              });
              var editor = CodeMirror.fromTextArea(textArea, editorSettings);
              // TODO make this editable preference!
              var autoFormat = true;
              if (autoFormat) {
                autoFormatEditor(editor);
              }
            }
          }
        }, 0);
      });
    }
}