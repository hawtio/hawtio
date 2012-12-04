function EditorController($scope, workspace:Workspace) {
  $scope.$watch('row', () => {
    // TODO is there a better way to find the textarea?
    var textAreas = $("textarea.messageDetail");
    var textArea = textAreas[0];
    if (textArea) {
      $(textArea).change(() => {
        console.log("Text area changed!!!");
        var text = textArea.textContent;
        var format = detectTextFormat(text);
        console.log("Format is: " + format);
        console.log("Found the text area which contains: " + text);
        var editorSettings = createEditorSettings(workspace, format, {
          readOnly: true
        });
        var editor = CodeMirror.fromTextArea(textArea, editorSettings);
        // TODO make this editable preference!
        var autoFormat = true;
        if (autoFormat) {
          autoFormatEditor(editor);
        }
      });
    }
  });
}