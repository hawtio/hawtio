/**
 * @module UI
 */
module UI {

  export function DeveloperPageController($scope, $http) {

    $scope.getContents = function(filename, cb) {
      var fullUrl = "app/ui/html/test/" + filename;
      $http({method: 'GET', url: fullUrl})
          .success(function(data, status, headers, config) {
            cb(data);
          })
          .error(function(data, status, headers, config) {
            cb("Failed to fetch " + filename + ": " + data);
          });
    };
  }
}