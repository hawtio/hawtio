module Core {
  export function HelpController($scope, $routeParams, marked, helpRegistry) {

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

    $scope.mapTopicName = function(topic) {
      return helpRegistry.mapTopicName(topic);
    }

    $scope.mapSubTopicName = function(topic, subtopic) {
      return helpRegistry.mapSubTopicName(subtopic);
    }

    $scope.topics = helpRegistry.getTopics();
    $scope.topic = $routeParams.topic;
    $scope.subTopic = Object.extended($scope.topics[$scope.topic]).keys().at(0);
    if (angular.isDefined($routeParams.subtopic)) {
      $scope.subTopic = $routeParams.subtopic
    }

    if (!angular.isDefined($scope.topics[$scope.topic])) {
      $scope.html = "Unable to download help data for " + $scope.topic;
    } else {
      
      $.ajax({
        url: $scope.topics[$scope.topic][$scope.subTopic],
        dataType: 'html',
        cache: false,
        success: function(data, textStatus, jqXHR) {
          $scope.html = "Unable to download help data for " + $scope.topic;
          if (angular.isDefined(data)) {
            $scope.html = marked(data);
          }
          $scope.$apply();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $scope.html = "Unable to download help data for " + $scope.topic;
          $scope.$apply();
        }
      })
    }
  }
}
