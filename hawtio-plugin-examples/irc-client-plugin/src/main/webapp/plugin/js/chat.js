/**
 * @module IRC
 */
var IRC = (function(IRC) {

  /**
   * @method ChatController
   * @param $scope
   * @param IRCService
   *
   * Controller for the chat interface
   */
  IRC.ChatController = function($element, $scope, IRCService, localStorage, jolokia, $location) {

    $scope.showNewChannelDialog = new UI.Dialog();

    $scope.newMessage = '';

    $scope.selectedChannel = localStorage['IRCSelectedChannel'];

    $scope.channels = IRCService.channels;

    if (!$scope.selectedChannel || !($scope.selectedChannel in $scope.channels)) {
      $scope.selectedChannel = IRC.SERVER;
    }

    $scope.selectedChannelObject = $scope.channels[$scope.selectedChannel];

    $scope.showChannelPrompt = function() {
      $scope.showNewChannelDialog.open();
    };

    $scope.newChannel = function(target) {
      if (!Core.isBlank(target)) {
        $scope.showNewChannelDialog.close();
        IRCService.joinChannel(target, function() {
          $scope.selectedChannel = target;
        });
      }
    };

    $scope.partChannel = function(target) {
      IRCService.partChannel(target, function() {
        if ($scope.selectedChannel === target) {
          $scope.selectedChannel = IRC.SERVER;
        }
      });
    };

    $scope.openQuery = function(target) {
      IRCService.joinChannel(target, function() {
        $scope.selectedChannel = target;
      });
    };

    $scope.sortNick = function(nick) {
      //IRC.log.debug("nick: ", nick);
      if (nick.startsWith("@")) {
        return "1 - " + nick;
      } else if (nick.startsWith("+")) {
        return "2 - " + nick;
      } else {
        return "3 - " + nick;
      }
    };

    $scope.disconnect = function() {
      IRCService.addDisconnectAction(function() {
        if ($location.path().startsWith("/irc/chat")) {
          $location.path("/irc/settings");
          Core.$apply($scope);
        }
      });
      IRCService.disconnect();
    };

    $scope.getNames = function() {
      if (!$scope.selectedChannelObject || !$scope.selectedChannelObject.names) {
        return [];
      }
      var answer = $scope.selectedChannelObject.names.map(function(name) {
        if (name.startsWith("@") || name.startsWith("+")) {
          return name.last(name.length - 1);
        }
        return name;
      });
      return answer;
    };

    $scope.hasTopic = function() {
      if (!$scope.selectedChannelObject) {
        return "";
      }
      if (!$scope.selectedChannelObject.topic || Core.isBlank($scope.selectedChannelObject.topic.topic)) {
        return "no-topic";
      }
      return "";
    };

    $scope.sortChannel = function(channel) {
      //IRC.log.debug("channel: ", channel);
      if (channel === IRC.SERVER) {
        return "1 - " + channel;
      }
      if (channel.startsWith("#")) {
        return "2 - " + channel;
      }
      return "3 - " + channel;
    };

    $scope.selectChannel = function(channel) {
      $scope.selectedChannel =  channel;
    };

    $scope.isSelectedChannel = function(channel) {
      if (channel === $scope.selectedChannel) {
        return "selected-channel";
      }
      return "";
    };

    $scope.sendMessage = function() {
      if (Core.isBlank($scope.newMessage)) {
        return;
      }

      var target = $scope.selectedChannel;
      if (target.startsWith("@") || target.startsWith("+")) {
        target = target.last(target.length - 1);
      }
      jolokia.request({
        type: 'exec',
        mbean: IRC.mbean,
        operation: 'message',
        arguments: [target, $scope.newMessage]
      }, {
        method: 'POST',
        success: function(response) {
          IRCService.privmsg({
            timestamp: Date.now(),
            'type': 'privmsg',
            target: target,
            fromSelf: true,
            user: {
              nick: IRCService.options.nickname
            },
            message: $scope.newMessage
          });
          $scope.newMessage = '';
          Core.$apply($scope);
        },
        error: function(response) {
          IRC.log.warn("Failed to send message: ", response.error);
          IRC.log.info("Stack trace: ", response.stacktrace);
          Core.$apply($scope);
        }

      })

    };

    $scope.$watch('selectedChannel', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        localStorage['IRCSelectedChannel'] = $scope.selectedChannel;
        $scope.selectedChannelObject = $scope.channels[$scope.selectedChannel];
        $element.find('.entry-widget').focus();
      }
    })

  };

  return IRC;

} (IRC || {}));
