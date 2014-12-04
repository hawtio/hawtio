/**
 * Module that contains several helper functions related to hawtio's code editor
 *
 * @module CodeEditor
 * @main CodeEditor
 */
module CodeEditor {
  // TODO break this out into a separate plugin and maybe combine with hawtio-editor directive?

  /**
   * Options for the CodeMirror text editor
   *
   * @class CodeMirrorOptions
   */
  export interface CodeMirrorOptions {
    /**
     * @property theme
     * @type String
     */
    theme: string;
    /**
     * @property tabSize
     * @type number
     */
    tabSize: number;
    /**
     * @property lineNumbers
     * @type boolean
     */
    lineNumbers: boolean;
    /**
     * @property indentWithTabs
     * @type boolean
     */
    indentWithTabs: boolean;
    /**
     * @property lineWrapping
     * @type boolean
     */
    lineWrapping: boolean;
    /**
     * @property autoClosetags
     * @type boolean
     */
    autoClosetags: boolean;
  }

  /**
   * @property GlobalCodeMirrorOptions
   * @for CodeEditor
   * @type CodeMirrorOptions
   */
  export var GlobalCodeMirrorOptions = {
    theme: "default",
    tabSize: 4,
    lineNumbers: true,
    indentWithTabs: true,
    lineWrapping: true,
    autoCloseTags: true
  };

  /**
   * Tries to figure out what kind of text we're going to render in the editor, either
   * text, javascript or XML.
   *
   * @method detectTextFormat
   * @for CodeEditor
   * @static
   * @param value
   * @returns {string}
   */
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
   * @static
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
   * @static
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
