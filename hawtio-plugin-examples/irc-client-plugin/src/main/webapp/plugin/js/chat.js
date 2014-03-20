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
  IRC.ChatController = function($scope, IRCService, localStorage) {

    $scope.selectedChannel = localStorage['IRCSelectedChannel'];

    $scope.channels = IRCService.channels;

    if (!$scope.selectedChannel || !($scope.selectedChannel in $scope.channels)) {
      $scope.selectedChannel = 'server';
    }

    $scope.selectedChannelObject = $scope.channels[$scope.selectedChannel];

    $scope.selectChannel = function(channel) {
      $scope.selectedChannel =  channel;
    }

    $scope.$watch('selectedChannel', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        localStorage['IRCSelectedChannel'] = $scope.selectedChannel;
        $scope.selectedChannelObject = $scope.channels[$scope.selectedChannel];
      }
    })

  };

  return IRC;

} (IRC || {}));
