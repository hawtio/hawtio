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

      handle: undefined,

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
      },
      disconnected: function(line) {
        IRC.log.debug("Disconnected from IRC server");
        Core.notification('info', "Disconnected from IRC Server");
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




    }

    return self;
  });

  return IRC;
}(IRC || {}));
