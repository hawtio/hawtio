/**
 * @module CodeEditor
 * @main CodeEditor
 */
module CodeEditor {
  // TODO break this out into a separate plugin and maybe combine with hawtio-editor directive?

  // TODO Wire up to a global config manager service
  export var GlobalCodeMirrorOptions = {
    theme: "default",
    tabSize: 4,
    lineNumbers: true,
    indentWithTabs: true,
    lineWrapping: true,
    autoCloseTags: true

    // TODO Add autoformat option (Not explicitly a code mirror option)
  };

  export function PreferencesController($scope, workspace:Workspace, localStorage, $templateCache) {
    $scope.exampleText = $templateCache.get("exampleText");
    $scope.codeMirrorEx = $templateCache.get("codeMirrorExTemplate");
    $scope.javascript = "javascript";

    $scope.preferences = GlobalCodeMirrorOptions;

    // If any of the preferences change, make sure to save them automatically
    $scope.$watch("preferences", function(newValue, oldValue) {
      if (newValue !== oldValue) {
        // such a cheap and easy way to update the example view :-)
        $scope.codeMirrorEx += " ";
        localStorage['CodeMirrorOptions'] = angular.toJson(angular.extend(GlobalCodeMirrorOptions, $scope.preferences));
      }
    }, true);

  }

  export function detectTextFormat(value: any):string {
    var answer = "text";
    if (value) {
      answer = "javascript";
      var trimmed = value.toString().trimLeft().trimRight();
      if (trimmed && trimmed.first() === '<' && trimmed.last() === '>') {
        answer = "xml";
      }
    }
    return answer;
  }

  /**
   * Auto formats the CodeMirror editor content to pretty print
   *
   * @method autoFormatEditor
   * @for CodeEditor
   * @param {CodeMirrorEditor} editor
   * @return {void}
   */
  export function autoFormatEditor(editor:CodeMirrorEditor) {
    if (editor) {
      var totalLines = editor.lineCount();
      //var totalChars = editor.getValue().length;
      var start = {line: 0, ch: 0};
      var end = {line: totalLines - 1, ch: editor.getLine(totalLines - 1).length};
      editor.autoFormatRange(start, end);
      editor.setSelection(start, start);
    }
  }

  /**
   * Used to configures the default editor settings (per Editor Instance)
   *
   * @method createEditorSettings
   * @for CodeEditor
   * @param {Object} options
   * @return {Object}
   */
  export function createEditorSettings(options:any = {}) {
    options.extraKeys = options.extraKeys || {};

    // Handle Mode
    (function(mode) {
      mode = mode || {name: "text"};

      if(typeof mode !== "object") {
        mode = {name: mode};
      }

      var modeName = mode.name;
      if(modeName === "javascript") {
        angular.extend(mode, {
          "json": true
        })
      }
    })(options.mode);

    // Handle Code folding folding
    (function(options) {
      var javascriptFolding = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
      var xmlFolding = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);

      // Mode logic inside foldFunction to allow for dynamic changing of the mode.
      // So don't have to listen to the options model and deal with re-attaching events etc...
      var foldFunction = function(codeMirror : CodeMirrorEditor, line: number) {
        var mode = codeMirror.getOption("mode");
        var modeName = mode["name"];
        if(!mode || !modeName) return;
        if(modeName === 'javascript') {
          javascriptFolding(codeMirror, line);
        } else if (modeName === "xml" || modeName.startsWith("html")) {
          xmlFolding(codeMirror, line);
        };
      };

      options.onGutterClick = foldFunction;
      options.extraKeys = angular.extend(options.extraKeys, {
        "Ctrl-Q": function (codeMirror) {
          foldFunction(codeMirror, codeMirror.getCursor().line);
        }
      });
    })(options);

    var readOnly = options.readOnly;
    if (!readOnly) {

      /*
       options.extraKeys = angular.extend(options.extraKeys, {
       "'>'": function (codeMirror) {
       codeMirror.closeTag(codeMirror, '>');
       },
       "'/'": function (codeMirror) {
       codeMirror.closeTag(codeMirror, '/');
       }
       });
       */
      options.matchBrackets = true;
    }

    // Merge the global config in to this instance of CodeMirror
    angular.extend(options, GlobalCodeMirrorOptions);

    return options;
  }
}
