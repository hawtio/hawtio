/*
 * grunt-reload
 * https://github.com/webxl/grunt-reload
 *
 * Copyright (c) 2012 webxl
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // node libs
    var path = require('path');
    var fs = require("fs");
    var taskEvent = new (require("events")).EventEmitter();

    // external libs
    var connect = require('connect');
    var buffers = require('buffers');
    var httpProxy = require('http-proxy');
    var WebSocketServer = require("websocket").server;

    var throttle = false;
    // support for multiple reload servers
    var servers = {};

    function handleReload(wsServer, target) {
        var connections = wsServer.connections;
        var path = grunt.file.watchFiles ? grunt.file.watchFiles.changed[0] : 'index.html';

        // apply_js_live
        var msg = '["refresh", {"path": "' + path + '", "target": "' + target + '"}]';

        for (var i = 0; i < connections.length; i++) {
            connections[i].sendUTF(msg);
        }
    }

    // simple router
    function route(method, path, cb) {
        return function (req, res, next) {
            if (req.method !== method) {
                return next();
            }

            if (path instanceof RegExp && req.url.match(path) === null || typeof path === 'string' && req.url !== path) {
                return next();
            }

            cb(req, res, next);
        };
    }

    grunt.registerTask('reload', "Reload connected clients when a file has changed.", function (target) {

        var server = servers[target ? target:'default'];

        if (server) {
            var errorcount = grunt.fail.errorcount;
            // throttle was needed early in development because of rapid triggering by the watch task. Not sure if it's still necessary
            if (!throttle) {
                if (target) {
                    taskEvent.emit('reload:' + target);
                } else {
                    taskEvent.emit('reload');
                }

                throttle = true;
                setTimeout(function () {
                    throttle = false;
                }, 2000);
                grunt.log.writeln("File updated. Reload triggered.");
            } else {
                return;
            }
            // Fail task if there were errors.
            if (grunt.fail.errorcount > errorcount) {
                return false;
            }
        } else {
            // start a server that can send a reload command over a websocket connection.

            var middleware = [];

            this.requiresConfig('reload');

            // Get values from config, or use defaults.
            var config = target ? grunt.config(['reload', target]) : grunt.config('reload');
            var port = config.port || 8001;
            var base = path.resolve(grunt.config('server.base') || '.');
            var reloadClientMarkup = '<script src="/__reload/client.js"></script>';

            if (!target) {
                target = 'default';
            }

            if (config.proxy) {
                var proxyConfig = config.proxy;
                var options = {
                    target:{
                        host:proxyConfig.host || 'localhost',
                        port:proxyConfig.port || grunt.config('server.port') || 80,
                        path:proxyConfig.path || '/' // not yet supported by http-proxy: https://github.com/nodejitsu/node-http-proxy/pull/172
                    }
                };
                var proxy = new httpProxy.HttpProxy(options);
                var targetUrl = 'http://' + options.target.host + ':' + options.target.port + options.target.path;

                // modify any proxied HTML requests to include the client script
                middleware.unshift(connect(
                    function (req, res) {

                        if (proxyConfig.includeReloadScript !== false) {
                            // monkey patch response, postpone header
                            var _write = res.write, _writeHead = res.writeHead, _end = res.end, _statusCode, _headers, tmpBuffer;

                            res.write = function (data) {
                                if (tmpBuffer) {
                                    tmpBuffer.push(data);
                                } else {
                                    _write.call(res, data);
                                }
                            };

                            res.writeHead = function (statusCode, headers) {
                                _statusCode = statusCode;
                                _headers = headers;
                                if (/html/.test(_headers["content-type"])) {
                                    // defer html & headers
                                    tmpBuffer = buffers();
                                } else {
                                    _writeHead.call(res, _statusCode, _headers);
                                }
                            };

                            res.end = function () {
                                if (tmpBuffer) {
                                    var html = tmpBuffer.toString();

                                    html = html.replace('</body>', reloadClientMarkup + '</body>');
                                    _headers['content-length'] = html.length;
                                    _writeHead.call(res, _statusCode, _headers);
                                    _write.call(res, html);
                                }
                                _end.call(res);
                            };
                        }

                        proxy.proxyRequest(req, res);
                    }
                ));

                grunt.log.writeln("Proxying " + targetUrl);

            } else {
                middleware.unshift(connect.static(base, { redirect:true }));
            }

            if (config.iframe) {
                // serve iframe
                middleware.unshift(route('GET', '/', function (req, res, next) {
                    var targetUrl = config.iframe.target;
                    res.end('<html><body></body><iframe height=100% width=100% src="' + targetUrl + '"></iframe>' +
                        reloadClientMarkup + '</body></html>');
                }));
            }

            if (config.liveReload) {
                // required by LR 2.x
                middleware.unshift(route('GET', /\/livereload.js(\?.*)?/, function (req, res, next) {
                    res.write('__reloadServerUrl="ws://localhost:' + config.port + '";\n');
                    fs.createReadStream(__dirname + "/include/reloadClient.js").pipe(res);
                }));
            }

            // provide route to client js
            middleware.unshift(route('GET', '/__reload/client.js', function (req, res, next) {
                fs.createReadStream(__dirname + "/include/reloadClient.js").pipe(res); // use connect.static.send ?
            }));

            // if --debug was specified, enable logging.
            if (grunt.option('debug')) {
                connect.logger.format('grunt', ('[D] reloadServer :method :url :status ' +
                    ':res[content-length] - :response-time ms').blue);
                middleware.unshift(connect.logger('grunt'));
            }

            // kick-off
            server = connect.apply(null, middleware).listen(port);

            servers[target] = server;

            if (!servers.default) {
                servers.default = server;
            }

            var wsServer = new WebSocketServer({
                httpServer:server,
                autoAcceptConnections:true
            });

            wsServer.on('connect', function (request) {

                var connection = request; //.accept(); //.accept('*', request.origin);
                console.log((new Date()) + ' Connection accepted.');
                connection.on('message', function (message) {
                    if (message.type === 'utf8') {
                        console.log('Received Message: ' + message.utf8Data);
                        if (message.utf8Data === 'trigger') {
                            grunt.helper('trigger', grunt.config('trigger.watchFile'));
                            connection.sendUTF('Update triggered');
                        }
                        // LiveReload support
                        if (message.utf8Data.match(/^http:\/\//)) {
                            connection.sendUTF("!!ver:1.6;");
                        }
                        if (message.utf8Data.match(/{.*/)) {
                            var handshake = "{ command: 'hello', protocols: [ " +
                                "'http://livereload.com/protocols/official-7', " +
                                "'http://livereload.com/protocols/2.x-origin-version-negotiation', " +
                                "'http://livereload.com/protocols/2.x-remote-control'" +
                                "], serverName: 'grunt-reload', }";
                            connection.sendUTF(handshake);
                        }
                    }
                });
                connection.on('close', function (reasonCode, description) {
                    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
                });
            });

            taskEvent.on('reload', function() {
                handleReload(wsServer);
            });

            if (target) {
                taskEvent.on('reload:' + target, function() {
                    handleReload(wsServer, target);
                });
            }

            grunt.log.writeln("reload server running at http://localhost:" + port);

        }
    });
};
