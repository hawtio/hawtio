module CodeEditor {
    // TODO Wire up to a global config manager service
    var GlobalCodeMirrorOptions = {
        theme: "default",
        tabSize: 4,
        lineNumbers: true,
        indentWithTabs: true,
        lineWrapping: true,
        autoCloseTags: true

        // TODO Add autoformat option (Not explicitly a code mirror option)
    };

    export function PreferencesController($scope, workspace:Workspace, localStorage) {
        $scope.preferences = GlobalCodeMirrorOptions;
        // TODO Should we the ability to select from some example messages to help set preferences?
        // $scope.codeMirrorModel = "...";

        /**
         * If any of the preferences change, make sure to save them automatically
         */
        // TODO Is this bad UX? Should we require an explicit 'save' ? So that users can 'cancel' the settings they worked on?
        $scope.$watch("preferences", function(newValue, oldValue) {
            // ...
            // TODO Need a global 'config' service for saving config state for us (If there isn't one already)
        });
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