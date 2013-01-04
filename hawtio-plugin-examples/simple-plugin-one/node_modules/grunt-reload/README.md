# grunt-reload

A grunt task that enables live reloading of updated watch files in the browser.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-reload`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-reload');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation

This plugin provides two grunt tasks: 'reload' and 'reloadServer'. 'reload' is designed to be called via the watch task configuration. 'reloadServer' is designed to be called on the command-line along with the watch task.

The reload task tells the page to refresh itself via websocket connection between the reloadServer task and the reloadClient.js that is appended to the requested html file. When the watch task detects a changed file, it will process its configured tasks, which should include the 'reload' task if it is setup like the example below.

Configuration:

* __port__: (number, default: 8001) Reverse proxy listens on this port. This is necessary for including reload client javascript.
* __proxy__: (object, optional) If present, this config object will enable a reverse proxy to your development server's content
  * __host__: (string, default: 'localhost') development server hostname
  * __port__: (number, default: server.port or 80) development server port
  * __includeReloadScript__: (boolean, default: true) includes the client js to listen for reload commands
* __iframe__: (object, optional)
  * __target__: (string) URL of development server
* __liveReload__: (boolean, only required for LiveReload 2.x)

## Reload methods

__Proxy__

This will automatically append the script to the requested HTML file. Here's how you would use grunt-reload with [grunt-less](https://github.com/jharding/grunt-less):

```javascript
// project configuration
grunt.initConfig({
    lint: {
        all:['js/*.js']
    },
    reload: {
        port: 6001,
        proxy: {
            host: 'localhost'
        }
    },
    watch:{
        files:['index.html', 'style.less'],
        tasks:'default reload'
    }

});

grunt.loadNpmTasks('grunt-less');
grunt.loadNpmTasks('grunt-reload');

grunt.registerTask('default', 'lint less');
```

__IFrame__

Use this method if you don't want to muck around with your server's response.

```javascript
...
    iframe: {
        target: 'http://localhost:9999'
    }
...
```

Your iframe'd dev site in this instance would be available at the default http://localhost:8001

__LiveReload extension__

This is useful if you want to reload CSS files in place in addition to the entire page when files change. It requires a [LiveReload extension](http://help.livereload.com/kb/general-use/browser-extensions). In-line reloading of CSS requires [grunt 4.0](https://github.com/cowboy/grunt/tree/wip).

Set the reload server to listen on LiveReload's default port:

```javascript
...
    port: 35729, // LR default
    liveReload: {}
...
```

Make sure you enable LR in your browser (click the LR button in Chrome)

__Manual include__

If you prefer hard-coding over proxies, extensions, and iframes, you can just do this:

```html
<script>
    __reloadServerUrl="ws://localhost:8001";
</script>
<script type="text/javascript" src="//localhost:8001/__reload/client.js"></script>
```

This makes the reload client work from any address.

## Usage

`grunt reload watch`

If you want to run a static server using the bundled server task, and enable reloading, you can configure something like this:

```javascript
...
    reload: {
        port: 6001,
        proxy: {
            host: 'localhost',
            port: 8000 // should match server.port config
        }
    },
    watch:{
        files:['index.html', 'style.less'],
        tasks:'lint less reload'
    }
...
grunt.registerTask('default', 'server reload watch');
```

Then just run:

`grunt`


## TODO
* ~~reload resources without refreshing entire page~~ use [LiveReload extensions](http://help.livereload.com/kb/general-use/browser-extensions) and grunt 4.x alpha
* ~~add option to run standalone web server for project~~ use server task for now
* write chrome extension to reload resources (css, images, templates)
    * the includeReloadScript & proxy options will probably become the fallback method of attaching the client
    * may allow one of three attach methods: extension, iframe, or proxy

## Release History
*   __06/15/2012 - 0.2.0__: Added support for grunt 4.0, [LiveReload extensions](http://help.livereload.com/kb/general-use/browser-extensions), iframes, and custom targets
*   __06/04/2012 - 0.1.2__: Removed connect 1.x requirement (no longer using connect.router). Added test. Clean up.
*   __06/03/2012 - 0.1.1__: Fixes 'socket hang up' error.
*   __05/27/2012 - 0.1.0__: Initial release.

## License
Copyright (c) 2012 webxl  
Licensed under the MIT license.
