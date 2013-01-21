module CodeEditor {
    // TODO Wire up to $rootScope, or to a controller potentially
    var GlobalCodeMirrorOptions = {
        tabSize: 2,
        lineNumbers: true,
        wordWrap: true
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
     * Used to configures the default editor settings (Per Editor Instance)
     */
    export function createEditorSettings(options:any = {}) {
        var mode = options.mode;
        var modeValue:any = mode;
        var readOnly = options.readOnly;
        options.extraKeys = options.extraKeys || {};

        if (mode) {
            if (mode === "javascript") {
                modeValue = {name: "javascript", json: true};
            } else {
                modeValue = {name: mode};
            }
        }
        options.mode = modeValue;

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

        if (!readOnly) {
            options.extraKeys = angular.extend(options.extraKeys, {
                "'>'": function (codeMirror) {
                    codeMirror.closeTag(codeMirror, '>');
                },
                "'/'": function (codeMirror) {
                    codeMirror.closeTag(codeMirror, '/');
                }
            });
            options.matchBrackets = true;
        }

        // Merge the global config in to this instance of CodeMirror
        angular.extend(options, GlobalCodeMirrorOptions);

        return options;
    }
}