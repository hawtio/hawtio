/**
 * @module Core
 */
module Core {
    // TODO would be nice to use a directive instead; but couldn't get it working :(
    export function EditorController($scope, workspace:Workspace) {
      // TODO Do we have to deal with Async data loading?
      var options = {
          readOnly: true,
          mode: {
            name: CodeEditor.detectTextFormat($scope.row.Text)
          }
      };
      $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);
    }
}
