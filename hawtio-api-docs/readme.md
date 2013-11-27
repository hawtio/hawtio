# hawtio API docs war

This module builds a static website of API documentation from the hawtio source JSDoc comments.  It uses [yuidoc](http://yui.github.io/yuidoc/) to generate a static website that includes generated HTML of all of the source.

To [install yuidoc](http://yui.github.io/yuidoc/) you use npm:

```
npm install -g yuidocjs
```

## Building

The war should build using `mvn clean install`

## Watching for source changes

You can run `mvn -Pwatch` to run yuidoc in a server mode.  It'll start up a web server on port 3000 that you can use to view the docs, which are generated on the fly when the page is accessed.  Any generation errors will be printed to the console.

## Examples

JSDoc Comments have to be [specifically formatted](http://yui.github.io/yuidoc/syntax/index.html) for yuidoc to pick them up, as it doesn't try and interpret the source, it just processes the JSDoc comments.  So for example:

##### Example Module Block

```javascript
/**
* This is my awesome module
*
* @module MyModule
* @main MyModule
*/
```

Generally in hawtio a typescript module spans several files, so put the @main tag in the fooPlugin.ts file, and leave it out of the other .ts files in the module, that way yuidoc knows which file is the entry point for the plugin

##### Example Class Block

```javascript
/**
* This is the description for my class.
*
* @class MyClass
* @constructor
*/
```

##### Example Method Block

```javascript
/**
* My method description.  Like other pieces of your comment blocks,
* this can span multiple lines.
*
* @method methodName
* @param {String} foo Argument 1
* @param {Object} config A config object
* @param {String} config.name The name on the config object
* @param {Function} config.callback A callback function on the config object
* @param {Boolean} [extra=false] Do extra, optional work
* @return {Boolean} Returns true on success
*/
```

For static functions that are in a module you could do:

```javascript
/**
* My awesome static function thingy
*
* @method myMethod
* @for MyModule
* @static
* @param {String} foo arg 1
* @return {any}
*/
```

##### Example Property Block

```javascript
/**
* My property description.  Like other pieces of your comment blocks,
* this can span multiple lines.
*
* @property propertyName
* @type {Object}
* @default "foo"
*/
```

again if the property is in a module, add a `@for` with the name of the module so it's not stuck in some random class.




