/**
 * @module SOCIAL
 */
 var SOCIAL = (function (SOCIAL) {

    /**
     * @property breadcrumbs
     * @type {{content: string, title: string, isValid: isValid, href: string}[]}
     *
     * Data structure that defines the sub-level tabs for
     * our plugin, used by the navbar controller to show
     * or hide tabs based on some criteria
     */
     SOCIAL.breadcrumbs = [
     {
      content: '<i class="icon-user"></i> User',
      title: "Search info about a Twitter User",
      isValid: function () { return true; },
      href: "#/social/user"
    },
    {
      content: '<i class="icon-search"></i> Tweets',
      title: "Search Tweets based on keywords",
      isValid: function () { return true; },
      href: "#/social/tweets"
    }
    ];

    /**
     * @function NavBarController
     *
     * @param $scope
     *
     * The controller for this plugin's navigation bar
     *
     */
     SOCIAL.NavBarController = function ($scope, workspace) {

      $scope.breadcrumbs = SOCIAL.breadcrumbs;
      $scope.hash = workspace.hash();

      $scope.$on('$routeChangeSuccess', function () {
        $scope.hash = workspace.hash();
      });

      $scope.isValid = function(link) {
        return true;
      };

      $scope.isActive = function (href) {
        return workspace.isLinkActive(href);
      };
    };

    return SOCIAL;

  }(SOCIAL || { }));
