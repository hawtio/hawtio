/**
 * @module Perspective
 */
module Perspective {

  /**
   * redirects the browser to the default page based on the detected profiles
   * @method DefaultPageController
   * @for Perspective
   * @param {ng.IScope} $scope
   * @param {ng.ILocationService} $location
   * @param {any} localStorage
   * @param {Core.Workspace} workspace
   */
  export function DefaultPageController($scope, $location, localStorage, workspace:Workspace, jolokia) {
    var url = Perspective.defaultPage($location, workspace, jolokia, localStorage);
    var path = Core.trimLeading(url, "#");
    if (path) {
      console.log("redirecting to default page: " + path);
      $location.url(path);
    } else {
      console.log("No default page could be chosen!");
    }
  }
}
