# Lightweight, unobtrusive, configurable JavaScript logger.

[logger.js](https://github.com/jonnyreeves/js-logger/blob/master/src/logger.js) will make you rich, famous and want for almost nothing - oh and it's a flexible abstraction over using `console.log` as well.

## Installation
js-Logger has zero dependencies and comes with AMD and CommonJS module boilerplate.  If the last sentence meant nothing to you then just lob the following into your page:

	<script src="https://raw.github.com/jonnyreeves/js-logger/master/src/logger.min.js"></script>

## Usage
Nothing beats the sheer ecstasy of logging!  js-Logger does its best to not be awkward and get in the way.  If you're the sort of person who just wants to get down and dirty then all you need is one line of code: 

	// Log messages will be written to the window's console.
	Logger.useDefaults();

Now, when you want to emit a red-hot log message, just drop one of the following (the syntax is identical to the `console` object)

	Logger.debug("I'm a debug message!");
	Logger.info("OMG! Check this window out!", window);
	Logger.warn("Purple Alert! Purple Alert!");
	Logger.error("HOLY SHI... no carrier.");

Log messages can get a bit annoying; you don't need to tell me, it's all cool.  If things are getting too noisy for your liking then it's time you read up on the `Logger.setLevel` method:

	// Only log WARN and ERROR messages.
	Logger.setLevel(Logger.WARN);
	Logger.debug("Donut machine is out of pink ones");  // Not a peep.
	Logger.warn("Asteroid detected!");  // Logs "Asteroid detected!", best do something about that!
	
	// Ah, you know what, I'm sick of all these messages.
	Logger.setLevel(Logger.OFF);
	Logger.error("Hull breach on decks 5 through to 41!");  // ...

## Log Handler Functions
All log messages are routed through a handler function which redirects filtered messages somewhere.  You can configure the handler function via `Logger.setHandler` nothing that the supplied function expects two arguments; the first being the log messages to output and the latter being a context object which can be inspected by the log handler.

	Logger.setHandler(function (messages, context) {
		// Send messages to a custom logging endpoint for analysis.
		// TODO: Add some security? (nah, you worry too much! :P)
		jQuery.post('/logs', { message: messages[0], level: context.level });
	}); 

## Named Loggers
Okay, let's get serious, logging is not for kids, it's for adults with serious software to write and mission critical log messages to trawl through.  To help you in your goal, js-Logger provides 'named' loggers which can be configured individual with their own contexts.

	// Retrieve a named logger and store it for use.
	var myLogger = Logger.get('ModuleA');
	myLogger.info("FizzWozz starting up");
	
	// This logger instance can be configured independent of all others (including the global one).
	myLogger.setLevel(Logger.WARN);
	
	// As it's the same instance being returned each time, you don't have to store a reference:
	Logger.get('ModuleA').warn('FizzWozz combombulated!");
    
Note that `Logger.setLevel()` will also change the current log filter level for all named logger instances; so typically you would configure your logger levels like so:

    // Create a couple of named loggers (typically in their own AMD file)
    var loggerA = Logger.get('LoggerA');
    var loggerB = Logger.get('LoggerB');
    
    // Configure log levels.
    Logger.setLevel(Logger.WARN);  // Global logging level.
    Logger.get('LoggerB').setLevel(Logger.DEBUG);  // Enable debug logging for LoggerB
