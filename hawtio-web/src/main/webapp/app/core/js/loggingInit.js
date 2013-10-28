
Logger.setLevel(Logger.INFO);
// we'll default to 100 statements I guess...
// TODO - make configurable...
window['LogBuffer'] = 100;

if ('localStorage' in window) {
  if ('logLevel' in window.localStorage) {
    var logLevel = JSON.parse(window.localStorage['logLevel']);
    // console.log("Using log level: ", logLevel);
    Logger.setLevel(logLevel);
  }

  if ('showLog' in window.localStorage) {
    var showLog = window.localStorage['showLog'];
    // console.log("showLog: ", showLog);
    if (showLog === 'true') {
      var container = document.getElementById("log-panel");
      container.setAttribute("style", "bottom: 50%;");
    }
  }

  if ('logBuffer' in window.localStorage) {
    var logBuffer = window.localStorage['logBuffer'];
    window['LogBuffer'] = parseInt(logBuffer);
  } else {
    window.localStorage['logBuffer'] = window['LogBuffer'];
  }
}

var consoleLogger = null;

if ('console' in window) {

  window['JSConsole'] = window.console;
  consoleLogger = function(messages, context) {
    var MyConsole = window['JSConsole'];
    var hdlr = MyConsole.log;

    // Prepend the logger's name to the log message for easy identification.
    if (context.name) {
      messages[0] = "[" + context.name + "] " + messages[0];
    }

    // Delegate through to custom warn/error loggers if present on the console.
    if (context.level === Logger.WARN && 'warn' in MyConsole) {
      hdlr = MyConsole.warn;
    } else if (context.level === Logger.ERROR && 'error' in MyConsole) {
      hdlr = MyConsole.error;
    } else if (context.level === Logger.INFO && 'info' in MyConsole) {
      hdlr = MyConsole.info;
    }

    try {
      hdlr.apply(MyConsole, messages);
    } catch (e) {
      MyConsole.log(messages);
    }
  };
}

var isArrayOrObject = function(o) {
  return (!!o) && (o.constructor === Array || o.constructor === Object);
};

window['logInterceptors'] = [];

Logger.setHandler(function(messages, context) {
  // MyConsole.log("context: ", context);
  // MyConsole.log("messages: ", messages);
  var container = document.getElementById("log-panel");
  var panel = document.getElementById("log-panel-statements");

  var node = document.createElement("li");

  var text = ""

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    if (isArrayOrObject(message)) {

      var obj = "" ;
      try {
        obj = '<pre data-language="javascript">' + JSON.stringify(message, null, 2) + '</pre>';
      } catch (error) {
        obj = message + " (failed to convert) ";
        // silently ignore, could be a circular object...
      }
      text = text + obj;
    } else {
      text = text + message;
    }
  }

  if (context.name) {
    text = '[<span class="green">' + context.name + '</span>] ' + text;
  }

  node.innerHTML = text;
  node.className = context.level.name;

  var scroll = false;
  if (container.scrollHeight = 0) {
    scroll = true;
  }

  if (panel.scrollTop > (panel.scrollHeight - container.scrollHeight - 200)) {
    scroll = true;
  }

  function onAdd() {
    panel.appendChild(node);
    if (panel.childNodes.length > parseInt(window['LogBuffer'])) {
      panel.firstChild.remove();
    }
    if (scroll) {
      panel.scrollTop = panel.scrollHeight;
    }
    if (consoleLogger) {
      consoleLogger(messages, context);
    }
    var interceptors = window['logInterceptors'];

    for (var i = 0; i < interceptors.length; i++) {
      interceptors[i](context.level.name, text);
    }
  }

  onAdd();

  /*
  try {
    Rainbow.color(node, onAdd);
  } catch (e) {
    // in case rainbow hits an error...
    onAdd();
  }
  */


});

// Catch uncaught exceptions and stuff so we can log them
window.onerror = function(msg, url, line) {
  Logger.error(msg, " (url:", url, ", line:", line, ")");
  // supress error alert
  return true;
};

// sneaky hack to redirect console.log !
window.console = {
  log: Logger.debug,
  warn: Logger.warn,
  error: Logger.error,
  info: Logger.info
};
