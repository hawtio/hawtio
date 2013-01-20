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

        if (mode) {
            if (mode === "javascript") {
                modeValue = {name: "javascript", json: true};
                var foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
                options.onGutterClick = foldFunc;
                options.extraKeys = {"Ctrl-Q": function (cm) {
                    foldFunc(cm, cm.getCursor().line);
                }};
            } else if (mode === "xml" || mode.startsWith("html")) {
                var foldFuncXml = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
                options.onGutterClick = foldFuncXml;
                options.extraKeys = {"Ctrl-Q": function (cm) {
                    foldFuncXml(cm, cm.getCursor().line);
                }};
            }
        }
        options.mode = modeValue;


        if (!readOnly) {
            options.extraKeys = {
                "'>'": function (cm) {
                    cm.closeTag(cm, '>');
                },
                "'/'": function (cm) {
                    cm.closeTag(cm, '/');
                }
            };
            options.matchBrackets = true;
        }

        // Merge the global config in to this instance of CodeMirror
        angular.extend(options, GlobalCodeMirrorOptions);

        return options;
    }
}