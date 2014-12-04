/// <reference path="baseIncludes.ts"/>
/// <reference path="core/js/coreInterfaces.ts"/>
/// <reference path="helpers/js/stringHelpers.ts"/>
/// <reference path="helpers/js/urlHelpers.ts"/>
/**
 * @module Core
 */
module Core {

  /**
   * The instance of this app's Angular injector, set once bootstrap has completed, helper functions can use this to grab angular services so they don't need them as arguments
   * @type {null}
   */
  export var injector:ng.auto.IInjectorService = null;

  var _urlPrefix:string = null;

  export var connectionSettingsKey = "jvmConnect";


  /**
   * Private method to support testing.
   *
   * @private
   */
  export function _resetUrlPrefix() {
    _urlPrefix = null;
  }

  /**
   * Prefixes absolute URLs with current window.location.pathname
   *
   * @param path
   * @returns {string}
   */
  export function url(path:string):string {
    if (path) {
      if (path.startsWith && path.startsWith("/")) {
        if (!_urlPrefix) {
          // lets discover the base url via the base html element
          _urlPrefix = (<JQueryStatic>$)('base').attr('href') || "";
          if (_urlPrefix.endsWith && _urlPrefix.endsWith('/')) {
              _urlPrefix = _urlPrefix.substring(0, _urlPrefix.length - 1);
          }
        }
        if (_urlPrefix) {
          return _urlPrefix + path;
        }
      }
    }
    return path;
  }

  /**
   * Returns location of the global window
   *
   * @returns {string}
   */
  export function windowLocation():Location {
    return window.location;
  }

  // use a better implementation of unescapeHTML
  String.prototype.unescapeHTML = function() {
    var txt = document.createElement("textarea");
    txt.innerHTML = this;
    return txt.value;
  };

  // add object.keys if we don't have it, used
  // in a few places
  if (!Object.keys) {
    console.debug("Creating hawt.io version of Object.keys()");
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

  /**
   * Private method to support testing.
   *
   * @private
   */
  export function _resetJolokiaUrls():Array<String> {
    // Add any other known possible jolokia URLs here
    jolokiaUrls = [
      Core.url("jolokia"), // instance configured by hawtio-web war file
      "/jolokia" // instance that's already installed in a karaf container for example
    ];
    return jolokiaUrls;
  }

  var jolokiaUrls:Array<String> = Core._resetJolokiaUrls();

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
  export function trimTrailing(text:string, postfix:string): string {
    if (text && postfix) {
      if (text.endsWith(postfix)) {
        return text.substring(0, text.length - postfix.length);
      }
    }
    return text;
  }

  /**
   * Loads all of the available connections from local storage
   * @returns {Core.ConnectionMap}
   */
  export function loadConnectionMap():Core.ConnectionMap {
    var localStorage = Core.getLocalStorage();
    try {
      var answer = <Core.ConnectionMap> angular.fromJson(localStorage[Core.connectionSettingsKey]);
      if (!answer) {
        return <Core.ConnectionMap> {};
      } else {
        return answer;
      }
    } catch (e) {
      // corrupt config
      delete localStorage[Core.connectionSettingsKey];
      return <Core.ConnectionMap> {};
    }
  }

  /**
   * Saves the connection map to local storage
   * @param map
   */
  export function saveConnectionMap(map:Core.ConnectionMap) {
    Logger.get("Core").debug("Saving connection map: ", StringHelpers.toString(map));
    localStorage[Core.connectionSettingsKey] = angular.toJson(map);
  }

  /**
   * Returns the connection options for the given connection name from localStorage
   */
  export function getConnectOptions(name:string, localStorage = Core.getLocalStorage()): ConnectOptions {
    if (!name) {
      return null;
    }
    return Core.loadConnectionMap()[name];
  }

  export var ConnectionName:string = null;

  /**
   * Returns the current connection name using the given search parameters
   */
  export function getConnectionNameParameter(search) {
    if (ConnectionName) {
      return ConnectionName;
    }
    var connectionName:string = undefined;
    if ('con' in window) {
      connectionName = <string> window['con'];
      Logger.get("Core").debug("Found connection name from window: ", connectionName);
    } else {
      connectionName = search["con"];
      if (angular.isArray(connectionName)) {
        connectionName = connectionName[0];
      }
      if (connectionName) {
        connectionName = connectionName.unescapeURL();
        Logger.get("Core").debug("Found connection name from URL: ", connectionName);
      } else {
        Logger.get("Core").debug("No connection name found, using direct connection to JVM");
      }
    }
    // Store the connection name once we've parsed it
    ConnectionName = connectionName;
    return connectionName;
  }

  /**
   * Creates the Jolokia URL string for the given connection options
   */
  export function createServerConnectionUrl(options:Core.ConnectOptions) {
    Logger.get("Core").debug("Connect to server, options: ", StringHelpers.toString(options));
    var answer:String = null;
    if (options.jolokiaUrl) {
      answer = options.jolokiaUrl;
    }
    if (answer === null) {
      answer = options.scheme || 'http';
      answer += '://' + (options.host || 'localhost');
      if (options.port) {
        answer += ':' + options.port;
      }
      if (options.path) {
        answer = UrlHelpers.join(<string>answer, <string>options.path);
      }
    }
    if (options.useProxy) {
      answer = UrlHelpers.join('proxy', <string>answer);
    }
    Logger.get("Core").debug("Using URL: ", answer);
    return answer;
  }

  /**
   * Returns Jolokia URL by checking its availability if not in local mode
   *
   * @returns {*}
   */
  export function getJolokiaUrl():String {
    var query = hawtioPluginLoader.parseQueryString();
    var localMode = query['localMode'];
    if (localMode) {
      Logger.get("Core").debug("local mode so not using jolokia URL");
      jolokiaUrls = <string[]>[];
      return null;
    }
    var uri:String = null;
    var connectionName = Core.getConnectionNameParameter(query);
    if (connectionName) {
      var connectOptions = Core.getConnectOptions(connectionName);
      if (connectOptions) {
        uri = createServerConnectionUrl(connectOptions);
        Logger.get("Core").debug("Using jolokia URI: ", uri, " from local storage");
      } else {
        Logger.get("Core").debug("Connection parameter found but no stored connections under name: ", connectionName);
      }
    }
    if (!uri) {
      var fakeCredentials = {
        username: 'public',
        password: 'biscuit'
      };
      var localStorage = getLocalStorage();
      if ('userDetails' in window) {
        fakeCredentials = window['userDetails'];
      } else if ('userDetails' in localStorage) {
        // user checked 'rememberMe'
        fakeCredentials = angular.fromJson(localStorage['userDetails']);
      }
      uri = <String> jolokiaUrls.find((url:String):boolean => {
        var jqxhr = (<JQueryStatic>$).ajax(<string>url, {
          async: false,
          username: fakeCredentials.username,
          password: fakeCredentials.password
        });
        return jqxhr.status === 200 || jqxhr.status === 401 || jqxhr.status === 403;
      });
      Logger.get("Core").debug("Using jolokia URI: ", uri, " via discovery");
    }
    return uri;
  }

  /**
   * Ensure our main app container takes up at least the viewport
   * height
   */
  export function adjustHeight() {
    var windowHeight = (<JQueryStatic>$)(window).height();
    var headerHeight = (<JQueryStatic>$)("#main-nav").height();
    var containerHeight = windowHeight - headerHeight;
    (<JQueryStatic>$)("#main").css("min-height", "" + containerHeight + "px");
  }


  /**
   * Returns true if we are running inside a Chrome app or (and?) extension
   */
  interface Chrome {
    app: any;
    extension: any;
  }

  declare var chrome:Chrome;

  export function isChromeApp() {
    var answer = false;
    try {
      answer = (chrome && chrome.app && chrome.extension) ? true : false;
    } catch (e) {
      answer = false;
    }
    //log.info("isChromeApp is: " + answer);
    return answer;
  }

  /**
   * Adds the specified CSS file to the document's head, handy
   * for external plugins that might bring along their own CSS
   *
   * @param path
   */
  export function addCSS(path) {
    if ('createStyleSheet' in document) {
      // IE9
      document.createStyleSheet(path);
    } else {
      // Everyone else
      var link = (<JQueryStatic>$)("<link>");
      (<JQueryStatic>$)("head").append(link);

      link.attr({
        rel: 'stylesheet',
        type: 'text/css',
        href: path
      });
    }
  }

  var dummyStorage = {};

  /**
   * Wrapper to get the window local storage object
   *
   * @returns {WindowLocalStorage}
   */
  export function getLocalStorage() {
    // TODO Create correct implementation of windowLocalStorage
    var storage:WindowLocalStorage = window.localStorage || <any> (function() {
      return dummyStorage;
    })();
    return storage;
  }

  /**
   * If the value is not an array then wrap it in one
   *
   * @method asArray
   * @for Core
   * @static
   * @param {any} value
   * @return {Array}
   */
  export function asArray(value:any):any[] {
    return angular.isArray(value) ? value : [value];
  }

  /**
   * Ensure whatever value is passed in is converted to a boolean
   *
   * In the branding module for now as it's needed before bootstrap
   *
   * @method parseBooleanValue
   * @for Core
   * @param {any} value
   * @param {Boolean} defaultValue default value to use if value is not defined
   * @return {Boolean}
   */
  export function parseBooleanValue(value:any, defaultValue:boolean = false):boolean {
    if (!angular.isDefined(value) || !value) {
      return defaultValue;
    }

    if (value.constructor === Boolean) {
      return <boolean>value;
    }

    if (angular.isString(value)) {
      switch (value.toLowerCase()) {
        case "true":
        case "1":
        case "yes":
          return true;
        default:
          return false;
      }
    }

    if (angular.isNumber(value)) {
      return value !== 0;
    }

    throw new Error("Can't convert value " + value + " to boolean");
  }

  export function toString(value:any):string {
    if (angular.isNumber(value)) {
      return numberToString(value);
    } else {
      return angular.toJson(value, true);
    } 
  } 

  /**
   * Converts boolean value to string "true" or "false"
   *
   * @param value
   * @returns {string}
   */
  export function booleanToString(value:boolean):string {
    return "" + value;
  }

  /**
   * object to integer converter
   *
   * @param value
   * @param description
   * @returns {*}
   */
  export function parseIntValue(value, description:string = "integer") {
    if (angular.isString(value)) {
      try {
        return parseInt(value);
      } catch (e) {
        console.log("Failed to parse " + description + " with text '" + value + "'");
      }
    } else if (angular.isNumber(value)) {
      return value;
    }
    return null;
  }

  /**
   * Formats numbers as Strings.
   *
   * @param value
   * @returns {string}
   */
  export function numberToString(value:number):string {
    return "" + value;
  }

  /**
   * object to integer converter
   *
   * @param value
   * @param description
   * @returns {*}
   */
  export function parseFloatValue(value, description:string = "float") {
    if (angular.isString(value)) {
      try {
        return parseFloat(value);
      } catch (e) {
        console.log("Failed to parse " + description + " with text '" + value + "'");
      }
    } else if (angular.isNumber(value)) {
      return value;
    }
    return null;
  }

  /**
   * Navigates the given set of paths in turn on the source object
   * and returns the last most value of the path or null if it could not be found.
   *
   * @method pathGet
   * @for Core
   * @static
   * @param {Object} object the start object to start navigating from
   * @param {Array} paths an array of path names to navigate or a string of dot separated paths to navigate
   * @return {*} the last step on the path which is updated
   */
  export function pathGet(object:any, paths:any) {
    var pathArray = (angular.isArray(paths)) ? paths : (paths || "").split(".");
    var value = object;
    angular.forEach(pathArray, (name):any => {
      if (value) {
        try {
          value = value[name];
        } catch (e) {
          // ignore errors
          return null;
        }
      } else {
        return null;
      }
    });
    return value;
  }

  /**
   * Navigates the given set of paths in turn on the source object
   * and updates the last path value to the given newValue
   *
   * @method pathSet
   * @for Core
   * @static
   * @param {Object} object the start object to start navigating from
   * @param {Array} paths an array of path names to navigate or a string of dot separated paths to navigate
   * @param {Object} newValue the value to update
   * @return {*} the last step on the path which is updated
   */
  export function pathSet(object:any, paths:any, newValue:any) {
    var pathArray = (angular.isArray(paths)) ? paths : (paths || "").split(".");
    var value = object;
    var lastIndex = pathArray.length - 1;
    angular.forEach(pathArray, (name, idx) => {
      var next = value[name];
      if (idx >= lastIndex || !angular.isObject(next)) {
        next = (idx < lastIndex) ? {} : newValue;
        value[name] = next;
      }
      value = next;
    });
    return value;
  }

  /**
   * Performs a $scope.$apply() if not in a digest right now otherwise it will fire a digest later
   *
   * @method $applyNowOrLater
   * @for Core
   * @static
   * @param {*} $scope
   */
  export function $applyNowOrLater($scope:ng.IScope) {
    if ($scope.$$phase || $scope.$root.$$phase) {
      setTimeout(() => {
        Core.$apply($scope);
      }, 50);
    } else {
      $scope.$apply();
    }
  }

  /**
   * Performs a $scope.$apply() after the given timeout period
   *
   * @method $applyLater
   * @for Core
   * @static
   * @param {*} $scope
   * @param {Integer} timeout
   */
  export function $applyLater($scope, timeout = 50) {
    setTimeout(() => {
      Core.$apply($scope);
    }, timeout);
  }

  /**
   * Performs a $scope.$apply() if not in a digest or apply phase on the given scope
   *
   * @method $apply
   * @for Core
   * @static
   * @param {*} $scope
   */
  export function $apply($scope:ng.IScope) {
    var phase = $scope.$$phase || $scope.$root.$$phase;
    if (!phase) {
      $scope.$apply();
    }
  }

  /**
   * Performs a $scope.$digest() if not in a digest or apply phase on the given scope
   *
   * @method $apply
   * @for Core
   * @static
   * @param {*} $scope
   */
  export function $digest($scope:ng.IScope) {
    var phase = $scope.$$phase || $scope.$root.$$phase;
    if (!phase) {
      $scope.$digest();
    }
  }

  /**
   * Look up a list of child element names or lazily create them.
   *
   * Useful for example to get the <tbody> <tr> element from a <table> lazily creating one
   * if not present.
   *
   * Usage: var trElement = getOrCreateElements(tableElement, ["tbody", "tr"])
   * @method getOrCreateElements
   * @for Core
   * @static
   * @param {Object} domElement
   * @param {Array} arrayOfElementNames
   * @return {Object}
   */
  export function getOrCreateElements(domElement, arrayOfElementNames:string[]) {
    var element = domElement;
    angular.forEach(arrayOfElementNames, name => {
      if (element) {
        var children = (<JQueryStatic>$)(element).children(name);
        if (!children || !children.length) {
          (<JQueryStatic>$)("<" + name + "></" + name + ">").appendTo(element);
          children = (<JQueryStatic>$)(element).children(name);
        }
        element = children;
      }
    });
    return element;
  }

  var _escapeHtmlChars = {
    "#": "&#35;",
    "'": "&#39;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  };

  /**
   * static unescapeHtml
   *
   * @param str
   * @returns {any}
   */
  export function unescapeHtml(str) {
    angular.forEach(_escapeHtmlChars, (value, key) => {
      var regex = new RegExp(value, "g");
      str = str.replace(regex, key);
    });
    str = str.replace(/&gt;/g, ">");
    return str;
  }

  /**
   * static escapeHtml method
   *
   * @param str
   * @returns {*}
   */
  export function escapeHtml(str) {
    if (angular.isString(str)) {
      var newStr = "";
      for (var i = 0; i < str.length; i++) {
        var ch = str.charAt(i);
        var ch = _escapeHtmlChars[ch] || ch;
        newStr += ch;
        /*
         var nextCode = str.charCodeAt(i);
         if (nextCode > 0 && nextCode < 48) {
         newStr += "&#" + nextCode + ";";
         }
         else {
         newStr += ch;
         }
         */
      }
      return newStr;
    }
    else {
      return str;
    }
  }

  /**
   * Returns true if the string is either null or empty
   *
   * @method isBlank
   * @for Core
   * @static
   * @param {String} str
   * @return {Boolean}
   */
  export function isBlank(str:string) {
    if (str === undefined || str === null) {
      return true;
    }
    if (angular.isString(str)) {
      return str.isBlank();
    } else {
      // TODO - not undefined but also not a string...
      return false;
    }
  }

  /**
   * Displays an alert message which is typically the result of some asynchronous operation
   *
   * @method notification
   * @static
   * @param type which is usually "success" or "error" and matches css alert-* css styles
   * @param message the text to display
   *
   */
  export function notification(type:string, message:string, options:any = null) {
    if (options === null) {
      options = {};
    }

    if (type === 'error' || type === 'warning') {
      if (!angular.isDefined(options.onclick)) {
        options.onclick = window['showLogPanel'];
      }
    }

    toastr[type](message, '', options);
  }

  /**
   * Clears all the pending notifications
   * @method clearNotifications
   * @static
   */
  export function clearNotifications() {
    toastr.clear();
  }

  /**
   * removes all quotes/apostrophes from beginning and end of string
   *
   * @param text
   * @returns {string}
   */
  export function trimQuotes(text:string) {
    if (text) {
      while (text.endsWith('"') || text.endsWith("'")) {
        text = text.substring(0, text.length - 1);
      }
      while (text.startsWith('"') || text.startsWith("'")) {
        text = text.substring(1, text.length);
      }
    }
    return text;
  }

  /**
   * Converts camel-case and dash-separated strings into Human readable forms
   *
   * @param value
   * @returns {*}
   */
  export function humanizeValue(value:any):string {
    if (value) {
      var text = value + '';
      try {
        text = text.underscore();
      } catch (e) {
        // ignore
      }
      try {
        text = text.humanize();
      } catch (e) {
        // ignore
      }
      return trimQuotes(text);
    }
    return value;
  }

}
