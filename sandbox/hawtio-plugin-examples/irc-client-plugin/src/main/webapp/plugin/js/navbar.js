/**
 * @module IRC
 */
var IRC = (function (IRC) {

  /**
   * @property breadcrumbs
   * @type {{content: string, title: string, isValid: isValid, href: string}[]}
   *
   * Data structure that defines the sub-level tabs for
   * our plugin, used by the navbar controller to show
   * or hide tabs based on some criteria
   */
  IRC.breadcrumbs = [
    {
      content: '<i class="icon-comments"></i> Chat',
      title: "Connect to IRC",
      isValid: function (IRCService) { return IRCService.isConnected(); },
      href: "#/irc/chat"
    },
    {
      content: '<i class="icon-cogs"></i> Settings',
      title: "Set up your IRC connection",
      isValid: function (IRCService) { return true; },
      href: "#/irc/settings"
    }
  ];

  /**
   * @function NavBarController
   *
   * @param $scope
   * @param workspace
   *
   * The controller for this plugin's navigation bar
   *
   */
  IRC.NavBarController = function($scope, IRCService, $location) {

    if ($location.path().startsWith("/irc/chat") && !IRCService.isConnected()) {
      $location.path("/irc/settings");
    }

    $scope.breadcrumbs = IRC.breadcrumbs;

    $scope.isValid = function(link) {
      return link.isValid(IRCService);
    };

  };

  return IRC;

} (IRC || {}));
