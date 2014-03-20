/**
 * @module IRC
 */
var IRC = (function(IRC) {

  // The IRC service handles the connection to
  // the server in the background
  IRC.module.factory("IRCService", function(jolokia, $rootScope) {
    var self = {

      channels: {
        server: {
          messages: []
        }
      },
      /**
       * @property options
       * Holds a reference to the connection options when
       * a connection is started
       */
      options: undefined,
      /**
       * @property handle
       * Stores the jolokia handle after we've connected for
       * fetching updates from the backend
       */
      handle: undefined,

      isConnected: function() {
        return self.handle !== undefined
      },

      error: function(line) {

      },
      notice: function(line) {
        IRC.log.debug("notice, target: ", line.target, " user: ", line.user, " message: ", line.message);
        if (line.target === "*") {
          angular.forEach(self.channels, function(value, key) {
            IRC.log.debug("Pushing message to channel: ", key);
            value.messages.push(line);
          });
        } else {
          if (! (line.target in self.channels) ) {
            self.channels[line.target] = {
              messages: [line]
            }
          } else {
            self.channels[line.target].messages.push(line);
          }
        }

      },
      part: function(line) {

      },
      invite: function(line) {

      },
      join: function(line) {

      },
      kick: function(line) {

      },
      mode: function(line) {

      },
      nick: function(line) {

      },
      privmsg: function(line) {

      },
      quit: function(line) {

      },
      reply: function(line) {
        IRC.log.debug("reply, num: ", line.num, " value: ", line.value, " message: ", line.message);
        self.channels.server.messages.push(line);
      },
      topic: function(line) {

      },
      unknown: function(line) {

      },
      registered: function(line) {
        IRC.log.debug("Connected to IRC server");
        Core.notification('info', "Connected to IRC Server");


        IRC.log.debug("Channel configuration: ", self.options.channels)
        if ( self.options.channels) {
          var channels = self.options.channels.split(',');
          channels.forEach(function(channel) {
            var trimmed = channel.trim();
            if (!trimmed.startsWith("#")) {
              trimmed = "#" + trimmed;
            }
            jolokia.request({
              type: 'exec',
              mbean: IRC.mbean,
              operation: "join(java.lang.String)",
              arguments: [trimmed]
            }, {
              success: function(response) {
                IRC.log.debug("Joined channel: ", trimmed);
                self.channels[trimmed] = {
                  messages: []
                };
                Core.$apply($rootScope);
              },
              error: function(response) {
                log.info('Failed to join channel ', trimmed, ' error: ', response.error);
                Core.$apply($rootScope);
              }
            });
          });
        }

      },
      disconnected: function(line) {
        IRC.log.debug("Disconnected from IRC server");
        Core.notification('info', "Disconnected from IRC Server");
        jolokia.unregister(self.handle);
        self.handle = undefined;
      },
      ping: function(line) {

      },

      dispatch: function(response) {
        if (response.value && response.value.length > 0) {
          response.value.forEach(function(line) {
            line['timestamp'] = Date.now();
            if (!line['type']) {
              line['type'] = 'unknown';
            }
            IRC.log.debug("Calling handler: ", line['type']);
            self[line['type']](line);
          });
          Core.$apply($rootScope);
        }
      },

      connect: function(options) {
        self.options = options;
        IRC.log.debug("Connecting to IRC service: ", options.host);
        jolokia.request({
          type: 'exec',
          mbean: IRC.mbean,
          operation: 'connect',
          arguments: [options]
        }, {
          method: 'POST',
          success: function(response) {
            IRC.log.debug("Got response: ", response);
            IRC.log.debug("Connected, registering callback");
            self.handle = jolokia.register({
              success: function(response) {
                self.dispatch(response);
              },
              error: function(response) {
                IRC.log.info("Error fetching: ", response.error);
                IRC.log.debug("stack trace: ", response.stacktrace);
                jolokia.unregister(self.handle);
                self.handle = undefined;
              }
            }, {
              type: 'exec',
              mbean: IRC.mbean,
              operation: 'fetch',
              arguments: []
            });
          },
          error: function(response) {
            IRC.log.warn("Failed to connect to server: ", response.error);
            IRC.log.info("Stack trace: ", response.stacktrace);
          }
        });
      }
    };

    return self;
  });

  return IRC;
}(IRC || {}));
