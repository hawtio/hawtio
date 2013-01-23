var logQueryMBean = 'org.fusesource.insight:type=LogQuery';

var _urlPrefix: string = null;

var numberTypeNames = {
  'byte': true,
  'short': true,
  'integer': true,
  'long': true,
  'float': true,
  'double': true,
  'java.lang.Byte': true,
  'java.lang.Short': true,
  'java.lang.Integer': true,
  'java.lang.Long': true,
  'java.lang.Float': true,
  'java.lang.Double': true
};

/**
 * Returns the number of lines in the given text
 */
function lineCount(value): number {
  var rows = 0;
  if (value) {
    rows = 1;
    value.toString().each(/\n/, () => rows++);
  }
  return rows;
}

function url(path: string): string {
  if (path) {
    if (path.startsWith("/")) {
      if (_urlPrefix === null) {
        _urlPrefix = window.location.pathname || "";
        if (_urlPrefix) {
          var idx = _urlPrefix.lastIndexOf("/");
          if (idx >= 0) {
            _urlPrefix = _urlPrefix.substring(0, idx);
          }
        }
        console.log("URI prefix is " + _urlPrefix);
      }
      return _urlPrefix + path;
    }
  }
  return path;
}

function humanizeValue(value:any):string {
  if (value) {
    var text = value.toString();
    return trimQuotes(text.underscore().humanize());
  }
  return value;
}

function detectTextFormat(value: any):string {
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

function trimQuotes(text:string) {
  while (text.endsWith('"') || text.endsWith("'")) {
    text = text.substring(0, text.length - 1);
  }
  while (text.startsWith('"') || text.startsWith("'")) {
    text = text.substring(1, text.length);
  }
  return text;
}

/**
 * Converts the given value to an array of query arguments.
 *
 * If the value is null an empty array is returned.
 * If the value is a non empty string then the string is split by commas
 */
function toSearchArgumentArray(value): string[] {
  if (value) {
    if (angular.isArray(value)) return value;
    if (angular.isString(value)) return value.split(',');
  }
  return [];
}

function folderMatchesPatterns(node, patterns) {
  if (node) {
    var folderNames = node.folderNames;
    if (folderNames) {
      return patterns.any((ignorePaths) => {
        for (var i = 0; i < ignorePaths.length; i++) {
          var folderName = folderNames[i];
          var ignorePath = ignorePaths[i];
          if (!folderName) return false;
          var idx = ignorePath.indexOf(folderName);
          if (idx < 0) {
            return false;
          }
        }
        return true;
      });
    }
  }
  return false;
}

function scopeStoreJolokiaHandle($scope, jolokia, jolokiaHandle) {
  // TODO do we even need to store the jolokiaHandle in the scope?
  if (jolokiaHandle) {
    $scope.$on('$destroy', function () {
      closeHandle($scope, jolokia)
    });
    $scope.jolokiaHandle = jolokiaHandle;
  }
}

function closeHandle($scope, jolokia) {
  var jolokiaHandle = $scope.jolokiaHandle
  if (jolokiaHandle) {
    //console.log('Closing the handle ' + jolokiaHandle);
    jolokia.unregister(jolokiaHandle);
    $scope.jolokiaHandle = null;
  }
}

function onSuccess(fn, options = {}) {
  options['ignoreErrors'] = true;
  options['mimeType'] = 'application/json';
  options['success'] = fn;
  if (!options['error']) {
    options['error'] = function (response) {
      //alert("Jolokia request failed: " + response.error);
      console.log("Jolokia request failed: " + response.error);
    };
  }
  return options;
}

function supportsLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}


function isNumberTypeName(typeName):bool {
  if (typeName) {
    var text = typeName.toString().toLowerCase();
    var flag = numberTypeNames[text];
    return flag;
  }
  return false;
}

function encodeMBeanPath(mbean) {
  return mbean.replace(/\//g, '!/').replace(':', '/').escapeURL();
}

function encodeMBean(mbean) {
  return mbean.replace(/\//g, '!/').escapeURL();
}

/**
 * Auto formats the CodeMirror editor content to pretty print
 */
function autoFormatEditor(editor:any) {
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
 * Configures the default editor settings
 */
function createEditorSettings(workspace, mode:string, options:any = {}) {
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

  // TODO make these editable preferences!
  options.tabSize = 2;
  options.lineNumbers = true;
  options.wordWrap = true;

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
  return options;
}

function escapeDots(text:string) {
  return text.replace(/\./g, '-');
}

/**
 * Displays an alert message which is typically the result of some asynchronous operation
 *
 * @param type which is usually "success" or "error" and matches css alert-* css styles
 * @param message the text to display
 */
// TODO Support vargs  as it would be nice to support notification("error", "Failed to get a response! '", response)
// TODO And to handle string substitutions accordingly too
function notification (type:string, message:string) {
    $("#alert-area").append($("<div class='alert alert-" + type + " fade in' data-alert><button type='button' class='close' data-dismiss='alert'>×</button>" + message + "</div>"));
    $(".alert").delay(5000).fadeOut("slow", function () { $(this).remove(); });
}


/**
 * Returns the CSS class for a log level based on if its info, warn, error etc.
 *
 * @return {string}
 */
function logLevelClass(level:string) {
  if (level) {
    var first = level[0];
    if (first === 'w' || first === "W") {
      return "warning"
    } else if (first === 'e' || first === "E") {
      return "error";
    } else if (first === 'd' || first === "d") {
      return "info";
    }
  }
  return "";
}

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [],
        k;
    for (k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        keys.push(k);
      }
    }
    return keys;
  };
}

module Core {
  
  export function hashToString(hash) {
    var keyValuePairs:string[] = [];
    angular.forEach(hash, function (value, key) {
      keyValuePairs.push(key + "=" + value);
    });
    var params = keyValuePairs.join("&");
    return encodeURI(params);
  }
  
  /*
   * Register a JMX operation to poll for changes
   */
  export function register(jolokia, scope, arguments: any, callback) {
    if (!angular.isDefined(scope.$jhandle) || !angular.isArray(scope.$jhandle)) {
      scope.$jhandle = [];
    }
    scope.$on('$destroy', function (event) {
      if (angular.isDefined(scope.$jhandle)) {
        scope.$jhandle.forEach(function (handle) {
          jolokia.unregister(handle);
        });
        delete scope.$jhandle;
      }
    });
    if (angular.isArray(arguments)) {
      if (arguments.length >= 1) {
        // TODO can't get this to compile in typescript :)
        //var args = [callback].concat(arguments);
        var args = [callback];
        angular.forEach(arguments, (value) => args.push(value));
        //var args = [callback];
        //args.push(arguments);
        var registerFn = jolokia.register;
        var handle = registerFn.apply(jolokia, args);
        scope.$jhandle.push(handle);
        jolokia.request(arguments, callback);
      }
    } else {
      var handle = jolokia.register(callback, arguments);
      scope.$jhandle.push(handle);
      jolokia.request(arguments, callback);
    }
  }
}
