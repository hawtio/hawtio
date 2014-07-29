/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../helpers/js/controllerHelpers.ts"/>
/// <reference path="coreInterfaces.ts"/>
/// <reference path="./tasks.ts"/>
/// <reference path="./workspace.ts"/>
/// <reference path="./folder.ts"/>
/// <reference path="../../ui/js/colors.ts"/>
/// <reference path="../../jmx/js/lazyLoaders.ts"/>

module Core {
  export var log:Logging.Logger = Logger.get("Core");
}

var numberTypeNames = {
  'byte': true,
  'short': true,
  'int': true,
  'long': true,
  'float': true,
  'double': true,
  'java.lang.byte': true,
  'java.lang.short': true,
  'java.lang.integer': true,
  'java.lang.long': true,
  'java.lang.float': true,
  'java.lang.double': true
};

/**
 * Returns the number of lines in the given text
 *
 * @method lineCount
 * @static
 * @param {String} value
 * @return {Number}
 *
 */
function lineCount(value): number {
  var rows = 0;
  if (value) {
    rows = 1;
    value.toString().each(/\n/, () => rows++);
  }
  return rows;
}

function safeNull(value:any):string {
  if (typeof value === 'boolean') {
    return value;
  } else if (typeof value === 'number') {
    // return numbers as-is
    return value;
  }
  if (value) {
    return value;
  } else {
    return "";
  }
}

function safeNullAsString(value:any, type:string):string {
  if (typeof value === 'boolean') {
    return "" + value;
  } else if (typeof value === 'number') {
    // return numbers as-is
    return "" + value;
  } else if (typeof value === 'string') {
    // its a string
    return "" + value;
  } else if (type === 'javax.management.openmbean.CompositeData' || type === '[Ljavax.management.openmbean.CompositeData;' || type === 'java.util.Map') {
    // composite data or composite data array, we just display as json
    // use json representation
    var data = angular.toJson(value, true);
    return data;
  } else if (type === 'javax.management.ObjectName') {
    return "" + (value == null ? "" : value.canonicalName);
  } else if (type === 'javax.management.openmbean.TabularData') {
    // tabular data is a key/value structure so loop each field and convert to array we can
    // turn into a String
    var arr = [];
    for (var key in value) {
      var val = value[key];
      var line = "" + key + "=" + val;
      arr.push(line);
    }
    // sort array so the values is listed nicely
    arr = arr.sortBy(row => row.toString());
    return arr.join("\n");
  } else if (angular.isArray(value)) {
    // join array with new line, and do not sort as the order in the array may matter
    return value.join("\n");
  } else if (value) {
    // force as string
    return "" + value;
  } else {
    return "";
  }
}

/**
 * Converts the given value to an array of query arguments.
 *
 * If the value is null an empty array is returned.
 * If the value is a non empty string then the string is split by commas
 *
 * @method toSearchArgumentArray
 * @static
 * @param {*} value
 * @return {String[]}
 *
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

/**
 * Pass in null for the success function to switch to sync mode
 *
 * @method onSuccess
 * @static
 * @param {Function} Success callback function
 * @param {Object} Options object to pass on to Jolokia request
 * @return {Object} initialized options object
 */
function onSuccess(fn, options = {}) {
  options['mimeType'] = 'application/json';
  if (angular.isDefined(fn)) {
    options['success'] = fn;
  }
  if (!options['method']) {
    options['method'] = "POST";
  }
  options['canonicalNaming'] = false;
  options['canonicalProperties'] = false;
  if (!options['error']) {
    options['error'] = (response) => {
      Core.defaultJolokiaErrorHandler(response, options);
    }
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


function isNumberTypeName(typeName):boolean {
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

function escapeMBeanPath(mbean) {
  return mbean.replace(/\//g, '!/').replace(':', '/');
}

function encodeMBean(mbean) {
  return mbean.replace(/\//g, '!/').escapeURL();
}

function escapeDots(text:string) {
  return text.replace(/\./g, '-');
}

/**
 * Escapes all dots and 'span' text in the css style names to avoid clashing with bootstrap stuff
 *
 * @method escapeTreeCssStyles
 * @static
 * @param {String} text
 * @return {String}
 */
function escapeTreeCssStyles(text:string) {
  return escapeDots(text).replace(/span/g, 'sp-an');
}

function showLogPanel() {
  var log = $("#log-panel");
  var body = $('body');
  localStorage['showLog'] = 'true';
  log.css({'bottom': '50%'});
  body.css({
    'overflow-y': 'hidden'
  });
}

/**
 * Returns the CSS class for a log level based on if its info, warn, error etc.
 *
 * @method logLevelClass
 * @static
 * @param {String} level
 * @return {String}
 */
function logLevelClass(level:string) {
  if (level) {
    var first = level[0];
    if (first === 'w' || first === "W") {
      return "warning"
    } else if (first === 'e' || first === "E") {
      return "error";
    } else if (first === 'i' || first === "I") {
      return "info";
    } else if (first === 'd' || first === "D") {
      // we have no debug css style
      return "";
    }
  }
  return "";
}

/**
 * @module Core
 */
module Core {

  export function toPath(hashUrl:string) {
    if (Core.isBlank(hashUrl)) {
      return hashUrl;
    }
    if (hashUrl.startsWith("#")) {
      return hashUrl.substring(1);
    } else {
      return hashUrl;
    }
  }

  export function parseMBean(mbean) {
    var answer = {};
    var parts = mbean.split(":");
    if (parts.length > 1) {
      answer['domain'] = parts.first();
      parts = parts.exclude(parts.first());
      parts = parts.join(":");
      answer['attributes'] = {};
      var nameValues = parts.split(",");
      nameValues.forEach((str) => {
        var nameValue = str.split('=');
        var name = nameValue.first().trim();
        nameValue = nameValue.exclude(nameValue.first());
        answer['attributes'][name] = nameValue.join('=').trim();
      });
    }
    return answer;
  }

  export function executePostLoginTasks() {
    log.debug("Executing post login tasks");
    Core.postLoginTasks.execute();
  }

  export function executePreLogoutTasks(onComplete: () => void) {
    log.debug("Executing pre logout tasks");
    Core.preLogoutTasks.onComplete(onComplete);
    Core.preLogoutTasks.execute();
  }

  /**
   * log out the current user
   * @for Core
   * @static
   * @method logout
   * @param {String} jolokiaUrl
   * @param {*} userDetails
   * @param {Object} localStorage
   * @param {Object} $scope
   * @param {Function} successCB
   * @param {Function} errorCB
   *
   */
  export function logout(jolokiaUrl,
                  userDetails,
                  localStorage,
                  $scope,
                  successCB: () => void = null,
                  errorCB: () => void = null) {

    if (jolokiaUrl) {
      var url = jolokiaUrl.replace("jolokia", "auth/logout/");

      Core.executePreLogoutTasks(() => {
        $.ajax(url, {
          type: "POST",
          success: () => {
            userDetails.username = null;
            userDetails.password = null;
            userDetails.loginDetails = null;
            userDetails.rememberMe = false;
            localStorage[jolokiaUrl] = angular.toJson(userDetails);
            if (successCB && angular.isFunction(successCB)) {
              successCB();
            }
            Core.$apply($scope);
          },
          error: (xhr, textStatus, error) => {
            // TODO, more feedback
            switch (xhr.status) {
              case 401:
                log.error('Failed to log out, ', error);
                break;
              case 403:
                log.error('Failed to log out, ', error);
                break;
              case 0:
                // this may happen during onbeforeunload -> logout, when XHR is cancelled
                break;
              default:
                log.error('Failed to log out, ', error);
                break;
            }
            if (errorCB && angular.isFunction(errorCB)) {
              errorCB();
            }
            Core.$apply($scope);
          }
        });

      });


    }

  }

  /**
   * Creates a link by appending the current $location.search() hash to the given href link,
   * removing any required parameters from the link
   * @method createHref
   * @for Core
   * @static
   * @param {ng.ILocationService} $location
   * @param {String} href the link to have any $location.search() hash parameters appended
   * @param {Array} removeParams any parameters to be removed from the $location.search()
   * @return {Object} the link with any $location.search() parameters added
   */
  export function createHref($location, href, removeParams = null) {
    var hashMap = angular.copy($location.search());
    // lets remove any top level nav bar related hash searches
    if (removeParams) {
      angular.forEach(removeParams, (param) =>  delete hashMap[param]);
    }
    var hash = Core.hashToString(hashMap);
    if (hash) {
      var prefix = (href.indexOf("?") >= 0) ? "&" : "?";
      href += prefix + hash;
    }
    return href;
  }

  /**
   * Trims the leading prefix from a string if its present
   * @method trimLeading
   * @for Core
   * @static
   * @param {String} text
   * @param {String} prefix
   * @return {String}
   */
  export function trimLeading(text:string, prefix:string) {
    if (text && prefix) {
      if (text.startsWith(prefix)) {
        return text.substring(prefix.length);
      }
    }
    return text;
  }

  /**
   * Trims the trailing postfix from a string if its present
   * @method trimTrailing
   * @for Core
   * @static
   * @param {String} trim
   * @param {String} postfix
   * @return {String}
   */
  export function trimTrailing(text:string, postfix:string) {
    if (text && postfix) {
      if (text.endsWith(postfix)) {
        return text.substring(0, text.length - postfix.length);
      }
    }
    return text;
  }

  /**
   * Turns the given search hash into a URI style query string
   * @method hashToString
   * @for Core
   * @static
   * @param {Object} hash
   * @return {String}
   */
  export function hashToString(hash) {
    var keyValuePairs:string[] = [];
    angular.forEach(hash, function (value, key) {
      keyValuePairs.push(key + "=" + value);
    });
    var params = keyValuePairs.join("&");
    return encodeURI(params);
  }

  /**
   * Parses the given string of x=y&bar=foo into a hash
   * @method stringToHash
   * @for Core
   * @static
   * @param {String} hashAsString
   * @return {Object}
   */
  export function stringToHash(hashAsString: string) {
    var entries = {};
    if (hashAsString) {
        var text = decodeURI(hashAsString);
        var items = text.split('&');
        angular.forEach(items, (item) => {
          var kv = item.split('=');
          var key = kv[0];
          var value = kv[1] || key;
          entries[key] = value;
        });
    }
    return entries;
  }

  /**
   * Register a JMX operation to poll for changes, only
   * calls back when a change occurs
   *
   * @param jolokia
   * @param scope
   * @param arguments
   * @param callback
   * @param options
   * @returns Object
   */
  export function registerForChanges(jolokia, $scope, arguments, callback:(response:any) => void, options?:any):() => void {
    var decorated = {
      responseJson: '',
      success: (response) => {
        var json = angular.toJson(response.value);
        if (decorated.responseJson !== json) {
          decorated.responseJson = json;
          callback(response);
        }
      }
    };
    angular.extend(decorated, options);
    return Core.register(jolokia, $scope, arguments, onSuccess(undefined, decorated));
  }

  // Jolokia caching stuff, try and cache responses so we don't always have to wait
  // for the server

  var responseHistory:any = null;

  export function getOrInitObjectFromLocalStorage(key:string):any {
    var answer:any = undefined;
    if (!(key in localStorage)) {
      localStorage[key] = angular.toJson({});
    }
    return angular.fromJson(localStorage[key]);
  }

  function keyForArgument(argument:any) {
    if (!('type' in argument)) {
      return null;
    }
    var answer = <string>argument['type'];
    switch(answer.toLowerCase()) {
      case 'exec':
        answer += ':' + argument['mbean'] + ':' + argument['operation'];
        break;
      case 'read':
        answer += ':' + argument['mbean'] + ':' + argument['attribute'];
        break;
      default:
        return null;
    }
    return answer;

  }

  function createResponseKey(arguments:any) {
    var answer = '';
    if (angular.isArray(arguments)) {
      answer = arguments.map((arg) => { return keyForArgument(arg); }).join(':');
    } else {
      answer = keyForArgument(arguments);
    }
    return answer;
  }

  function getResponseHistory():any {
    if (responseHistory === null) {
      //responseHistory = getOrInitObjectFromLocalStorage('responseHistory');
      responseHistory = {};
      log.debug("Created response history from local storage: ", responseHistory);
    }
    return responseHistory;
  }

  function addResponse(arguments:any, value:any) {
    var responseHistory = getResponseHistory();
    var key = createResponseKey(arguments);
    if (key === null) {
      log.debug("key for arguments is null: ", arguments);
      return;
    }
    //log.debug("Adding response to history, key: ", key, " value: ", value);
    responseHistory[key] = value;
    //localStorage['responseHistory'] = angular.toJson(responseHistory);
  }

  function getResponse(jolokia, arguments:any, callback:any) {
    var responseHistory = getResponseHistory();
    var key = createResponseKey(arguments);
    if (key === null) {
      jolokia.request(arguments, callback);
      return;
    }
    if (key in responseHistory && 'success' in callback) {
      var value = responseHistory[key];
      // do this async, the controller might not handle us immediately calling back
      setTimeout(() => {
        callback['success'](value);
      }, 10);
    } else {
      log.debug("Unable to find existing response for key: ", key);
      jolokia.request(arguments, callback);
    }
  }
  // end jolokia caching stuff


  /**
   * Register a JMX operation to poll for changes
   * @method register
   * @for Core
   * @static
   * @return {Function} a zero argument function for unregistering  this registration
   * @param {*} jolokia
   * @param {*} scope
   * @param {Object} arguments
   * @param {Function} callback
   */
  export function register(jolokia, scope, arguments: any, callback) {
    /*
    if (scope && !Core.isBlank(scope.name)) {
      Core.log.debug("Calling register from scope: ", scope.name);
    } else {
      Core.log.debug("Calling register from anonymous scope");
    }
    */
    if (!angular.isDefined(scope.$jhandle) || !angular.isArray(scope.$jhandle)) {
      //log.debug("No existing handle set, creating one");
      scope.$jhandle = [];
    } else {
      //log.debug("Using existing handle set");
    }
    if (angular.isDefined(scope.$on)) {
      scope.$on('$destroy', function (event) {
        unregister(jolokia, scope);
      });
    }

    var handle = null;

    var responseHistory = getResponseHistory();

    if ('success' in callback) {
      var cb = callback.success;
      var args = arguments;
      callback.success = (response) => {
        addResponse(args, response);
        cb(response);
      }
    }

    if (angular.isArray(arguments)) {
      if (arguments.length >= 1) {
        // TODO can't get this to compile in typescript :)
        //var args = [callback].concat(arguments);
        var args = <any>[callback];
        angular.forEach(arguments, (value) => args.push(value));
        //var args = [callback];
        //args.push(arguments);
        var registerFn = jolokia.register;
        handle = registerFn.apply(jolokia, args);
        scope.$jhandle.push(handle);
        getResponse(jolokia, arguments, callback);
      }
    } else {
      handle = jolokia.register(callback, arguments);
      scope.$jhandle.push(handle);
      getResponse(jolokia, arguments, callback);
    }
    return () => {
      if (handle !== null) {
        scope.$jhandle.remove(handle);
        jolokia.unregister(handle);
      }
    };
  }

    /**
     * Register a JMX operation to poll for changes using a jolokia search using the given mbean pattern
     * @method registerSearch
     * @for Core
     * @static
     * @paran {*} jolokia
     * @param {*} scope
     * @param {String} mbeanPattern
     * @param {Function} callback
     */
    export function registerSearch(jolokia, scope, mbeanPattern:string, callback) {
        if (!angular.isDefined(scope.$jhandle) || !angular.isArray(scope.$jhandle)) {
            scope.$jhandle = [];
        }
        if (angular.isDefined(scope.$on)) {
            scope.$on('$destroy', function (event) {
                unregister(jolokia, scope);
            });
        }
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
                jolokia.search(mbeanPattern, callback);
            }
        } else {
            var handle = jolokia.register(callback, arguments);
            scope.$jhandle.push(handle);
            jolokia.search(mbeanPattern, callback);
        }
    }

    export function unregister(jolokia, scope) {
      if (angular.isDefined(scope.$jhandle)) {
        scope.$jhandle.forEach(function (handle) {
          jolokia.unregister(handle);
        });
        delete scope.$jhandle;
      }
    }

  /**
   * The default error handler which logs errors either using debug or log level logging based on the silent setting
   * @param response the response from a jolokia request
   */
  export function defaultJolokiaErrorHandler (response, options = {}) {
    //alert("Jolokia request failed: " + response.error);
    var stacktrace = response.stacktrace;
    if (stacktrace) {
      var silent = options['silent'];
      if (!silent) {
        var operation = Core.pathGet(response, ['request', 'operation']) || "unknown";
        if (stacktrace.indexOf("javax.management.InstanceNotFoundException") >= 0 ||
          stacktrace.indexOf("javax.management.AttributeNotFoundException") >= 0 ||
          stacktrace.indexOf("java.lang.IllegalArgumentException: No operation") >= 0) {
          // ignore these errors as they can happen on timing issues
          // such as its been removed
          // or if we run against older containers
          Core.log.debug("Operation ", operation, " failed due to: ", response['error']);
          Core.log.debug("Stack trace: ", Logger.formatStackTraceString(response['stacktrace']));
        } else {
          Core.log.warn("Operation ", operation, " failed due to: ", response['error']);
          Core.log.info("Stack trace: ", Logger.formatStackTraceString(response['stacktrace']));
        }
      } else {
        Core.log.debug("Operation ", operation, " failed due to: ", response['error']);
        Core.log.debug("Stack trace: ", Logger.formatStackTraceString(response['stacktrace']));
      }
    }
  }

  /**
   * Logs any failed operation and stack traces
   */
  export function logJolokiaStackTrace(response) {
    var stacktrace = response.stacktrace;
    if (stacktrace) {
      var operation = Core.pathGet(response, ['request', 'operation']) || "unknown";
      Core.log.info("Operation ", operation, " failed due to: ", response['error']);
      Core.log.info("Stack trace: ", Logger.formatStackTraceString(response['stacktrace']));
    }
  }


  /**
   * Converts the given XML node to a string representation of the XML
   * @method xmlNodeToString
   * @for Core
   * @static
   * @param {Object} xmlNode
   * @return {Object}
   */
  export function xmlNodeToString(xmlNode) {
    try {
      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
      return (new XMLSerializer()).serializeToString(xmlNode);
    }
    catch (e) {
      try {
        // Internet Explorer.
        return xmlNode.xml;
      }
      catch (e) {
        //Other browsers without XML Serializer
        console.log('WARNING: XMLSerializer not supported');
      }
    }
    return false;
  }

  /**
   * Returns true if the given DOM node is a text node
   * @method isTextNode
   * @for Core
   * @static
   * @param {Object} node
   * @return {Boolean}
   */
  export function isTextNode(node) {
    return node && node.nodeType === 3;
  }

  /**
   * Returns the lowercase file extension of the given file name or returns the empty
   * string if the file does not have an extension
   * @method fileExtension
   * @for Core
   * @static
   * @param {String} name
   * @param {String} defaultValue
   * @return {String}
   */
  export function fileExtension(name: string, defaultValue: string = "") {
    var extension = defaultValue;
    if (name) {
      var idx = name.lastIndexOf(".");
      if (idx > 0) {
        extension = name.substring(idx + 1, name.length).toLowerCase();
      }
    }
    return extension;
  }

  export function getUUID() {
    var d = new Date();
    var ms = (d.getTime() * 1000) + d.getUTCMilliseconds();
    var random = Math.floor((1 + Math.random()) * 0x10000);
    return ms.toString(16) + random.toString(16);
  }

  var _versionRegex = /[^\d]*(\d+)\.(\d+)(\.(\d+))?.*/

  /**
   * Parses some text of the form "xxxx2.3.4xxxx"
   * to extract the version numbers as an array of numbers then returns an array of 2 or 3 numbers.
   *
   * Characters before the first digit are ignored as are characters after the last digit.
   * @method parseVersionNumbers
   * @for Core
   * @static
   * @param {String} text a maven like string containing a dash then numbers separated by dots
   * @return {Array}
   */
  export function parseVersionNumbers(text: string) {
    if (text) {
      var m = text.match(_versionRegex);
      if (m && m.length > 4) {
        var m1 = m[1];
        var m2 = m[2];
        var m4 = m[4];
        if (angular.isDefined(m4)) {
          return [parseInt(m1), parseInt(m2), parseInt(m4)];
        } else if (angular.isDefined(m2)) {
          return [parseInt(m1), parseInt(m2)];
        } else if (angular.isDefined(m1)) {
          return [parseInt(m1)];
        }
      }
    }
    return null;
  }

  /**
   * Converts a version string with numbers and dots of the form "123.456.790" into a string
   * which is sortable as a string, by left padding each string between the dots to at least 4 characters
   * so things just sort as a string.
   *
   * @param text
   * @return {string} the sortable version string
   */
  export function versionToSortableString(version: string, maxDigitsBetweenDots = 4) {
    return (version || "").split(".").map(x => {
      var length = x.length;
      return (length >= maxDigitsBetweenDots)
        ? x : x.padLeft(' ', maxDigitsBetweenDots - length)
    }).join(".");
  }

  export function time(message: string, fn) {
    var start = new Date().getTime();
    var answer = fn();
    var elapsed = new Date().getTime() - start;
    console.log(message + " " + elapsed);
    return answer;
  }

  /**
   * Compares the 2 version arrays and returns -1 if v1 is less than v2 or 0 if they are equal or 1 if v1 is greater than v2
   * @method compareVersionNumberArrays
   * @for Core
   * @static
   * @param {Array} v1 an array of version numbers with the most significant version first (major, minor, patch).
   * @param {Array} v2
   * @return {Number}
   */
  export function compareVersionNumberArrays(v1:number[], v2:number[]) {
    if (v1 && !v2) {
      return 1;
    }
    if (!v1 && v2) {
      return -1;
    }
    if (v1 === v2) {
      return 0;
    }
    for (var i = 0; i < v1.length; i++) {
      var n1 = v1[i];
      if (i >= v2.length) {
        return 1;
      }
      var n2 = v2[i];
      if (!angular.isDefined(n1)) {
        return -1;
      }
      if (!angular.isDefined(n2)) {
        return 1;
      }
      if (n1 > n2) {
        return 1;
      } else if (n1 < n2) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * Helper function which converts objects into tables of key/value properties and
   * lists into a <ul> for each value.
   * @method valueToHtml
   * @for Core
   * @static
   * @param {any} value
   * @return {String}
   */
  export function valueToHtml(value) {
    if (angular.isArray(value)) {
      var size = value.length;
      if (!size) {
        return "";
      } else if (size === 1) {
        return valueToHtml(value[0]);
      } else {
        var buffer = "<ul>";
        angular.forEach(value, (childValue) => {
          buffer += "<li>" + valueToHtml(childValue) + "</li>"
        });
        return buffer + "</ul>"
      }
    } else if (angular.isObject(value)) {
      var buffer = "<table>";
      angular.forEach(value, (childValue, key) => {
        buffer += "<tr><td>" + key + "</td><td>" + valueToHtml(childValue) + "</td></tr>"
      });
      return buffer + "</table>"
    } else if (angular.isString(value)) {
      var uriPrefixes = ["http://", "https://", "file://", "mailto:"];
      var answer = value;
      angular.forEach(uriPrefixes, (prefix) => {
        if (answer.startsWith(prefix)) {
          answer = "<a href='" + value + "'>" + value + "</a>";
        }
      });
      return answer;
    }
    return value;
  }

  /**
   * If the string starts and ends with [] {} then try parse as JSON and return the parsed content or return null
   * if it does not appear to be JSON
   * @method tryParseJson
   * @for Core
   * @static
   * @param {String} text
   * @return {Object}
   */
  export function tryParseJson(text: string) {
    text = text.trim();
    if ((text.startsWith("[") && text.endsWith("]")) || (text.startsWith("{") && text.endsWith("}"))) {
      try {
        return JSON.parse(text);
      } catch (e) {
        // ignore
      }
    }
    return null;
  }

  /**
   * Given values (n, "person") will return either "1 person" or "2 people" depending on if a plural
   * is required using the String.pluralize() function from sugarjs
   * @method maybePlural
   * @for Core
   * @static
   * @param {Number} count
   * @param {String} word
   * @return {String}
   */
  export function maybePlural(count: Number, word: string) {
    var pluralWord = (count === 1) ? word : word.pluralize();
    return "" + count + " " + pluralWord;
  }

  /**
   * given a JMX ObjectName of the form <code>domain:key=value,another=something</code> then return the object
   * <code>{key: "value", another: "something"}</code>
   * @method objectNameProperties
   * @for Core
   * @static
   * @param {String} name
   * @return {Object}
   */
  export function objectNameProperties(objectName: string) {
    var entries = {};
    if (objectName) {
      var idx = objectName.indexOf(":");
      if (idx > 0) {
        var path = objectName.substring(idx + 1);
        var items = path.split(',');
        angular.forEach(items, (item) => {
          var kv = item.split('=');
          var key = kv[0];
          var value = kv[1] || key;
          entries[key] = value;
        });
      }
    }
    return entries;
  }

  export function setPageTitle($document, title:Core.PageTitle) {
    $document.attr('title', title.getTitleWithSeparator(' '));
  }

  export function setPageTitleWithTab($document, title:Core.PageTitle, tab:string) {
    $document.attr('title', title.getTitleWithSeparator(' ') + " " + tab);
  }

  /**
   * Returns the Folder object for the given domain name and type name or null if it can not be found
   * @method getMBeanTypeFolder
   * @for Core
   * @static
   * @param {Workspace} workspace
   * @param {String} domain
   * @param {String} typeName}
   * @return {Folder}
   */
  export function getMBeanTypeFolder(workspace:Workspace, domain: string, typeName: string):Folder {
    if (workspace) {
      var mbeanTypesToDomain = workspace.mbeanTypesToDomain || {};
      var types = mbeanTypesToDomain[typeName] || {};
      var answer = types[domain];
      if (angular.isArray(answer) && answer.length) {
        return answer[0];
      }
      return answer;
    }
    return null;
  }

  /**
   * Returns the JMX objectName for the given jmx domain and type name
   * @method getMBeanTypeObjectName
   * @for Core
   * @static
   * @param {Workspace} workspace
   * @param {String} domain
   * @param {String} typeName
   * @return {String}
   */
  export function getMBeanTypeObjectName(workspace:Workspace, domain: string, typeName: string):string {
    var folder = Core.getMBeanTypeFolder(workspace, domain, typeName);
    return Core.pathGet(folder, ["objectName"]);
  }

  /**
   * Removes dodgy characters from a value such as '/' or '.' so that it can be used as a DOM ID value
   * and used in jQuery / CSS selectors
   * @method toSafeDomID
   * @for Core
   * @static
   * @param {String} text
   * @return {String}
   */
  export function toSafeDomID(text: string) {
    return text ? text.replace(/(\/|\.)/g, "_") : text;
  }


  /**
   * Invokes the given function on each leaf node in the array of folders
   * @method forEachLeafFolder
   * @for Core
   * @static
   * @param {Array[Folder]} folders
   * @param {Function} fn
   */
  export function forEachLeafFolder(folders, fn) {
    angular.forEach(folders, (folder) => {
      var children = folder["children"];
      if (angular.isArray(children) && children.length > 0) {
        forEachLeafFolder(children, fn);
      } else {
        fn(folder);
      }
    });
  }


  export function extractHashURL(url:string) {
    var parts = url.split('#');
    if (parts.length === 0) {
      return url;
    }
    var answer:string = parts[1];
    if (parts.length > 1) {
      var remaining = parts.last(parts.length - 2);
      remaining.forEach((part) => {
        answer = answer + "#" + part;
      });
    }
    return answer;
  }

  export function authHeaderValue(userDetails:UserDetails) {
    return getBasicAuthHeader(userDetails.username, userDetails.password);
  }

  export function getBasicAuthHeader(username:string, password:string) {
    var authInfo = username + ":" + password;
    authInfo = authInfo.encodeBase64();
    return "Basic " + authInfo;
  }

  var httpRegex = new RegExp('^(https?):\/\/(([^:/?#]*)(?::([0-9]+))?)');


  /**
   * Breaks a URL up into a nice object
   * @method parseUrl
   * @for Core
   * @static
   * @param url
   * @returns object
   */
  export function parseUrl(url:string):any {
    if (Core.isBlank(url)) {
      return null;
    }

    var matches = url.match(httpRegex);

    if (matches === null) {
      return null;
    }

    //log.debug("matches: ", matches);

    var scheme = matches[1];
    var host = matches[3];
    var port = matches[4];

    var parts:string[] = null;
    if (!Core.isBlank(port)) {
      parts = url.split(port);
    } else {
      parts = url.split(host);
    }

    var path = parts[1];
    if (path && path.startsWith('/')) {
      path = path.slice(1, path.length);
    }

    //log.debug("parts: ", parts);

    return {
      scheme: scheme,
      host: host,
      port: port,
      path: path
    }
  }

  export class ConnectToServerOptions {
    public scheme:string = "http";
    public host:string;
    public port:number;
    public path:string;
    public useProxy:boolean = true;
    public jolokiaUrl:string;
    public userName:string;
    public password:string;
    public view:string;
    public name:string;
  }

  export function getDocHeight() {
    var D = document;
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, (<any>D.documentElement).offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
  }


  /**
   * If a URL is external to the current web application, then
   * replace the URL with the proxy servlet URL
   * @method useProxyIfExternal
   * @for Core
   * @static
   * @param {String} connectUrl
   * @return {String}
   */
  export function useProxyIfExternal(connectUrl) {
    if (Core.isChromeApp()) {
      return connectUrl;
    }
    var host = window.location.host;
    if (!connectUrl.startsWith("http://" + host + "/") && !connectUrl.startsWith("https://" + host + "/")) {
        // lets remove the http stuff
        var idx = connectUrl.indexOf("://");
        if (idx > 0) {
          connectUrl = connectUrl.substring(idx + 3);
        }
        // lets replace the : with a /
        connectUrl = connectUrl.replace(":", "/");
        connectUrl = Core.trimLeading(connectUrl, "/");
        connectUrl = Core.trimTrailing(connectUrl, "/");
        connectUrl = Core.url("/proxy/" + connectUrl);
    }
    return connectUrl;
  }

  export function getRecentConnections(localStorage) {
    if (Core.isBlank(localStorage['recentConnections'])) {
      Core.clearConnections();
    }
    return angular.fromJson(localStorage['recentConnections']);    
  }

  export function addRecentConnection(localStorage, name, url) {
    var recent = getRecentConnections(localStorage);
    recent = recent.add({
      'name': name,
      'url': url  
    }).unique((c) => { return c.name; }).first(5);
    localStorage['recentConnections'] = angular.toJson(recent);
  }

  export function removeRecentConnection(localStorage, name) {
    var recent = getRecentConnections(localStorage);
    recent = recent.exclude((conn) => { return conn.name === name; });
    localStorage['recentConnections'] = angular.toJson(recent);
  }

  export function clearConnections() {
    localStorage['recentConnections'] = '[]';
  }

  export function connectToServer(localStorage, options:ConnectToServerOptions) {

    log.debug("Connect to server, options: ", options);

    var connectUrl = options.jolokiaUrl;

    var userDetails = {
      username: options['userName'],
      password: options['password']
    };

    var json = angular.toJson(userDetails);
    if (connectUrl) {
      localStorage[connectUrl] = json;
    }
    var view = options.view;
    var full = "";
    var useProxy = options.useProxy && !Core.isChromeApp();
    if (connectUrl) {
      if (useProxy) {
        // lets remove the http stuff
        var idx = connectUrl.indexOf("://");
        if (idx > 0) {
          connectUrl = connectUrl.substring(idx + 3);
        }
        // lets replace the : with a /
        connectUrl = connectUrl.replace(":", "/");
        connectUrl = Core.trimLeading(connectUrl, "/");
        connectUrl = Core.trimTrailing(connectUrl, "/");
        connectUrl = options.scheme + "://" + connectUrl;
        connectUrl = Core.url("/proxy/" + connectUrl);
      } else {
        if (connectUrl.indexOf("://") < 0) {
          connectUrl = options.scheme + "://" + connectUrl;
        }
      }
      console.log("going to server: " + connectUrl + " as user " + options.userName);
      localStorage[connectUrl] = json;

      full = "?url=" + encodeURIComponent(connectUrl);
      if (view) {
        full += "#" + view;
      }
    } else {

      var host = options.host || "localhost";
      var port = options.port;
      var path = Core.trimLeading(options.path || "jolokia", "/");
      path = Core.trimTrailing(path, "/");

      if (port > 0) {
        host += ":" + port;
      }
      var connectUrl = host + "/" + path;
      localStorage[connectUrl] = json;

      if (connectUrl.indexOf("://") < 0) {
        connectUrl = options.scheme + "://" + connectUrl;
      }

      if (useProxy) {
        connectUrl = Core.url("/proxy/" + connectUrl);
      }
      console.log("going to server: " + connectUrl + " as user " + options.userName);
      localStorage[connectUrl] = json;

      full = "?url=" + encodeURIComponent(connectUrl);
      if (view) {
        full += "#" + view;
      }
    }
    if (full) {
      log.info("Full URL is: " + full);
      Core.addRecentConnection(localStorage, options.name, full);
      window.open(full);
    }

  }

  /**
   * Extracts the url of the target, eg usually http://localhost:port, but if we use fabric to proxy to another host,
   * then we return the url that we proxied too (eg the real target)
   *
   * @param {ng.ILocationService} $location
   * @param {String} scheme to force use a specific scheme, otherwise the scheme from location is used
   * @param {Number} port to force use a specific port number, otherwise the port from location is used
   */
  export function extractTargetUrl($location, scheme, port) {
    if (angular.isUndefined(scheme)) {
      scheme = $location.scheme();
    }

    var host = $location.host();

    //  $location.search()['url']; does not work for some strange reason
    // var qUrl = $location.search()['url'];

    // if its a proxy request using hawtio-proxy servlet, then the url parameter
    // has the actual host/port
    var qUrl = $location.absUrl();
    var idx = qUrl.indexOf("url=");
    if (idx > 0) {
      qUrl = qUrl.substr(idx + 4);
      var value = decodeURIComponent(qUrl);
      if (value) {
        idx = value.indexOf("/proxy/");
        // after proxy we have host and optional port (if port is not 80)
        if (idx > 0) {
          value = value.substr(idx + 7);
          // if the path has http:// or some other scheme in it lets trim that off
          idx = value.indexOf("://");
          if (idx > 0) {
            value = value.substr(idx + 3);
          }
          var data = value.split("/");
          if (data.length >= 1) {
            host = data[0];
          }
          if (angular.isUndefined(port) && data.length >= 2) {
            var qPort = Core.parseIntValue(data[1], "port number");
            if (qPort) {
              port = qPort;
            }
          }
        }
      }
    }

    if (angular.isUndefined(port)) {
      port = $location.port();
    }

    var url = scheme + "://" + host;
    if (port != 80) {
      url += ":" + port;
    }
    return url;
  }

  /**
   * Returns true if the $location is from the hawtio proxy
   */
  export function isProxyUrl($location) {
    var url = $location.url();
    return url.indexOf('/hawtio/proxy/') > 0;
  }

  /**
   * handy do nothing converter for the below function
   **/
  export function doNothing(value:any) { return value; }

  // moved these into their own helper file
  export var bindModelToSearchParam = ControllerHelpers.bindModelToSearchParam;
  export var reloadWhenParametersChange = ControllerHelpers.reloadWhenParametersChange;

  /**
   * Creates a jolokia object for connecting to the container with the given remote jolokia URL,
   * username and password
   * @method createJolokia
   * @for Core
   * @static
   * @param {String} url
   * @param {String} username
   * @param {String} password
   * @return {Object}
   */
  export function createJolokia(url: string, username: string, password: string) {
    var jolokiaParams = {
      url: url,
      username: username,
      password: password,
      canonicalNaming: false, ignoreErrors: true, mimeType: 'application/json'
    };
    return new Jolokia(jolokiaParams);
  }

  /**
   * Returns a new function which ensures that the delegate function is only invoked at most once
   * within the given number of millseconds
   * @method throttled
   * @for Core
   * @static
   * @param {Function} fn the function to be invoked at most once within the given number of millis
   * @param {Number} millis the time window during which this function should only be called at most once
   * @return {Object}
   */
  export function throttled(fn, millis: number) {
    var nextInvokeTime: number = 0;
    var lastAnswer = null;
    return () => {
      var now = Date.now();
      if (nextInvokeTime < now) {
        nextInvokeTime = now + millis;
        lastAnswer = fn();
      } else {
        //log.debug("Not invoking function as we did call " + (now - (nextInvokeTime - millis)) + " ms ago");
      }
      return lastAnswer;
    }
  }

  /**
   * Attempts to parse the given JSON text and returns the JSON object structure or null.
   *Bad JSON is logged at info level.
   *
   * @param text a JSON formatted string
   * @param message description of the thing being parsed logged if its invalid
   */
  export function parseJsonText(text: string, message: string = "JSON") {
    var answer = null;
    try {
      answer = angular.fromJson(text);
    } catch (e) {
      log.info("Failed to parse " + message + " from: " + text +  ". " + e);
    }
    return answer;
  }

  /**
   * Returns the humanized markup of the given value
   */
  export function humanizeValueHtml(value:any):string {
    var formattedValue = "";
    if (value === true) {
      formattedValue = '<i class="icon-check"></i>';
    } else if (value === false) {
      formattedValue = '<i class="icon-check-empty"></i>';
    } else {
      formattedValue = humanizeValue(value);
    }
    return formattedValue;
  }

  /**
   * Gets a query value from the given url
   *
   * @param url  url
   * @param parameterName the uri parameter value to get
   * @returns {*}
   */
  export function getQueryParameterValue(url, parameterName) {
    var parts;

    var query = (url||'').split('?');
    if (query && query.length > 0) {
      parts = query[1];
    } else {
      parts = '';
    }

    var vars = parts.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == parameterName) {
        return decodeURIComponent(pair[1]);
      }
    }
    // not found
    return null;
  }

  /**
   * Creates a remote workspace given a remote jolokia for querying the JMX MBeans inside the jolokia
   * @param remoteJolokia
   * @param $location
   * @param localStorage
   * @return {Core.Workspace|Workspace}
   */
  export function createRemoteWorkspace(remoteJolokia, $location, localStorage, $rootScope = null, $compile = null, $templateCache = null, userDetails = null) {
    // lets create a child workspace object for the remote container
    var jolokiaStatus = {
      xhr: null
    };
    // disable reload notifications
    var jmxTreeLazyLoadRegistry = Jmx.lazyLoaders;
    var profileWorkspace = new Workspace(remoteJolokia, jolokiaStatus, jmxTreeLazyLoadRegistry, $location, $compile, $templateCache, localStorage, $rootScope, userDetails);

    log.info("Loading the profile using jolokia: " + remoteJolokia);
    profileWorkspace.loadTree();
    return profileWorkspace;
  }


  /**
   * Takes a value in ms and returns a human readable
   * duration
   * @param value
   */
  export function humanizeMilliseconds(value:number):String {

    if (!angular.isNumber(value)) {
      return "XXX";
    }

    var seconds = value / 1000;
    var years = Math.floor(seconds / 31536000);
    if (years) {
      return maybePlural(years, "year");
    }
    var days = Math.floor((seconds %= 31536000) / 86400);
    if (days) {
      return maybePlural(days, "day");
    }
    var hours = Math.floor((seconds %= 86400) / 3600);
    if (hours) {
      return maybePlural(hours, 'hour');
    }
    var minutes = Math.floor((seconds %= 3600) / 60);
    if (minutes) {
      return maybePlural(minutes, 'minute');
    }
    seconds = Math.floor(seconds % 60);
    if (seconds) {
      return maybePlural(seconds, 'second');
    }
    return value + " ms";
  }

  export function storeConnectionRegex(regexs, name, json) {
    if (!regexs.any((r) => { r['name'] === name })) {
      var regex = '';

      if (json['useProxy']) {
        regex = '/hawtio/proxy/';
      } else {
        regex = '//';
      }
      regex += json['host'] + ':' + json['port'] + '/' + json['path'];
      regexs.push({
        name: name,
        regex: regex.escapeURL(true),
        color: UI.colors.sample()
      });
      writeRegexs(regexs);
    }
  }

  export function getRegexs() {
    var regexs:any = [];
    try {
      regexs = angular.fromJson(localStorage['regexs']);
    } catch (e) {
      // corrupted config
      delete localStorage['regexs'];
    }
    return regexs;
  }

  export function removeRegex(name) {
    var regexs = Core.getRegexs();
    var hasFunc = (r) => { return r['name'] === name; };
    if (regexs.any(hasFunc)) {
      regexs = regexs.exclude(hasFunc);
      Core.writeRegexs(regexs);
    }
  }

  export function writeRegexs(regexs) {
    localStorage['regexs'] = angular.toJson(regexs);
  }

  export function maskPassword(value) {
    if (value) {
      var text = value.toString();
      // we use the same patterns as in Apache Camel in its
      // org.apache.camel.util.URISupport.sanitizeUri
      var userInfoPattern = "(.*://.*:)(.*)(@)";
      value = value.replace(new RegExp(userInfoPattern, 'i'), "$1xxxxxx$3");
    }

    return value;
  }

  /**
   * Match the given filter against the text, ignoring any case.
   * <p/>
   * This operation will regard as a match if either filter or text is null/undefined.
   * As its used for filtering out, unmatched.
   * <p/>
   *
   * @param text   the text
   * @param filter the filter
   * @return true if matched, false if not.
   */
  export function matchFilterIgnoreCase(text, filter) {
    if (angular.isUndefined(text) || angular.isUndefined(filter)) {
      return true;
    }

    text = text.toString().trim().toLowerCase();
    filter = filter.toString().trim().toLowerCase();

    if (text.length === 0 || filter.length === 0) {
      return true;
    }

    return text.indexOf(filter) > -1;
  }

}
