### Core plugin features

#### User Notifications

Notifications are provided by toastr.js.  In hawtio there's a simple function that wraps invoking toastr so it's pretty easy to pop up a notification:

```
notification('error', 'Oh no!');
notification('warning', 'Better watch out!');
```

The available levels are 'info', 'success', 'warning' and 'error'.


#### Logging

Logging in hawtio plugins can be done either by using console.* functions or by using hawtio's Logging service.  In either case logs are routed to hawtio's logging console as well as the javascript console.  The log level is controlled in the preferences page.

The logging API is consistent with many other log APIs out there, for example:

```
Logger.info("Some log at info level");
Logger.warn("Oh snap!");
```

The Logger object has 4 levels it can log at, debug, info, warn and error.  In hawtio messages logged at either warn or error will result in a notification.

It's also possible to create a named logger.  Named loggers just prefix the log statements, for example:

```
Logger.get('MyPlugin').debug('Hey, something happened!');
```





