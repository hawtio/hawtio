/// <reference path="dockerRegistryPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module DockerRegistry {

  export var TopLevel = controller("TopLevel", ["$scope", "$http", "$timeout", ($scope, $http:ng.IHttpService, $timeout:ng.ITimeoutService) => {
    $scope.repositories = <Array<DockerImageRepository>>[];
    $scope.fetched = false;
    $scope.restURL = '';
    getDockerImageRepositories((restURL:string, repositories:DockerImageRepositories) => {
      $scope.restURL = restURL;
      $scope.fetched = true;
      if (repositories) {
        $scope.repositories = repositories.results;
        var previous = angular.toJson($scope.repositories);
        $scope.fetch = PollHelpers.setupPolling($scope, (next:() => void) => {
          var searchURL = UrlHelpers.join($scope.restURL, SEARCH_FRAGMENT);
          $http.get(searchURL).success((repositories:DockerImageRepositories) => {
            if (repositories && repositories.results) {
              if (previous !== angular.toJson(repositories.results)) {
                $scope.repositories = repositories.results;
                previous = angular.toJson($scope.repositories);
              }
            }
            next();
          });
        });
        $scope.fetch();
      } else {
        log.debug("Failed initial fetch of image repositories");
      }
    });
    $scope.$watchCollection('repositories', (repositories) => {
      if (!Core.isBlank($scope.restURL)) {
        if (!repositories || repositories.length === 0) {
            $scope.$broadcast("DockerRegistry.Repositories", $scope.restURL, repositories);
            return;
        }
        // we've a new list of repositories, let's refresh our info on 'em
        var outstanding = repositories.length;
        function maybeNotify() {
          outstanding = outstanding - 1;
          if (outstanding <= 0) {
            $scope.$broadcast("DockerRegistry.Repositories", $scope.restURL, repositories);
          }
        }
        repositories.forEach((repository:DockerImageRepository) => {
          var tagURL = UrlHelpers.join($scope.restURL, 'v1/repositories/' + repository.name + '/tags');
          // we'll give it half a second as sometimes tag info isn't instantly available
          $timeout(() => {
            log.debug("Fetching tags from URL: ", tagURL);
            $http.get(tagURL).success((tags:DockerImageTag) => {
              log.debug("Got tags: ", tags, " for image repository: ", repository.name);
              repository.tags = tags;
              maybeNotify();
            }).error((data) => {
              log.debug("Error fetching data for image repository: ", repository.name, " error: ", data);
              maybeNotify();
            });
          }, 500);
        });
      }
    });
  }]);

}
