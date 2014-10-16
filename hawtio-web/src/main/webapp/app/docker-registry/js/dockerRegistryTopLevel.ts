/// <reference path="dockerRegistryPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
module DockerRegistry {

  export var TopLevel = controller("TopLevel", ["$scope", "$http", ($scope, $http:ng.IHttpService) => {
    $scope.repositories = <Array<DockerImageRepository>>[];
    $scope.restURL = '';
    getDockerImageRepositories((restURL:string, repositories:DockerImageRepositories) => {
      $scope.restURL = restURL;
      if ($scope.repositories) {
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
        // we've a new list of repositories, let's refresh our info on 'em
        var outstanding = repositories.length;
        repositories.forEach((repository:DockerImageRepository) => {
          var tagURL = UrlHelpers.join($scope.restURL, 'v1/repositories/' + repository.name + '/tags');
          log.debug("Fetching tags from URL: ", tagURL);
          $http.get(tagURL).success((tags:DockerImageTag) => {
            log.debug("Got tags: ", tags, " for image repository: ", repository.name);
            repository.tags = tags;
          }).error((data) => {
            log.debug("Error fetching data for image repository: ", repository.name, " error: ", data);
          });
        });
        $scope.$broadcast("DockerRegistry.Repositories", $scope.restURL, repositories);
      }
    });
  }]);

}
