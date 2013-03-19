module Core {
  export function HelpController($scope, $routeParams, $location, helpRegistry) {

    $scope.$on('hawtioNewHelpTopic', function() {
      $scope.topics = helpRegistry.getTopics();
    });

    $scope.isTopicActive = function(topic) {
      if (topic === $scope.topic) {
        return true;
      }
      return false;
    }

    $scope.isSubTopicActive = function(topic) {
      if (topic === $scope.subTopic) {
        return true;
      }
      return false;
    }

    $scope.prettyName = function(subTopic) {

    }

    $scope.topics = helpRegistry.getTopics();
    $scope.topic = $routeParams.topic;
    $scope.subTopic = $routeParams.subTopic || Object.extended($scope.topics[$scope.topic]).keys().at(0);

    $scope.html = "";

    // console.log("HelpRegistry:", helpRegistry.getTopics());

    $.get($scope.topics[$scope.topic][$scope.subTopic], function(data) {
      $scope.html = marked(data);
      $scope.$apply();
    });

  }
}
