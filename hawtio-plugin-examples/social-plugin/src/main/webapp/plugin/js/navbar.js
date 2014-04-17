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
            content: '<i class="icon-comments"></i> User',
            title: "Search info about a User",
            isValid: function () { return true; },
            href: "#/social/user"
        },
        {
            content: '<i class="icon-cogs"></i> Tweets',
            title: "Search Tweets",
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
    SOCIAL.NavBarController = function ($scope) {

        $scope.breadcrumbs = SOCIAL.breadcrumbs;

        $scope.isValid = function(link) {
            return true;
        };
    };

    return SOCIAL;

}(SOCIAL || { }));
