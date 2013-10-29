module Core {
  export function HelpController($scope, $routeParams, marked, helpRegistry, branding) {

    $scope.branding = branding;

    $scope.topics = helpRegistry.getTopics();
    $scope.topic = $routeParams.topic;
    $scope.subTopic = Object.extended($scope.topics[$scope.topic]).keys().at(0);
    if (angular.isDefined($routeParams.subtopic)) {
      $scope.subTopic = $routeParams.subtopic
    }

    // when on the index pages, filter the user subTopic unless on the dev page
    var isIndex = $scope.topic === "index";
    var filterSubTopic = $scope.subTopic;
    if (isIndex && filterSubTopic !== "developer") {
      filterSubTopic = "user";
    }

    $scope.breadcrumbs = [
      {
        topic: "index",
        subTopic: "user",
        label: "User Guide"
      },
      {
        topic: "index",
        subTopic: "faq",
        label: "FAQ"
      },
      {
        topic: "index",
        subTopic: "changes",
        label: "Changes"
      },
      {
        topic: "index",
        subTopic: "developer",
        label: "Developers"
      }
    ];

    // lets select the active tab
    var activeBreadcrumb = $scope.breadcrumbs.find(b => b.topic === $scope.topic && b.subTopic === $scope.subTopic);
    if (activeBreadcrumb) activeBreadcrumb.active = true;

    $scope.sections = [];
    angular.forEach($scope.topics, (details, topic) => {
      // lets hide any index topics or any topics which don't have a filter sub topic
      if (topic !== "index" && details[filterSubTopic]) {
        $scope.sections.push({
          topic: topic,
          subTopic: filterSubTopic,
          label: helpRegistry.mapTopicName(topic),
          active: topic === $scope.topic
        });
      }
    });
    $scope.sections = $scope.sections.sortBy("label");

    $scope.$on('hawtioNewHelpTopic', function () {
      $scope.topics = helpRegistry.getTopics();
    });

    $scope.$watch('topics', (newValue, oldValue) => {
      log.debug("Topics: ", $scope.topics);
    });


    if (!angular.isDefined($scope.topics[$scope.topic])) {
      $scope.html = "Unable to download help data for " + $scope.topic;
    } else {

      $.ajax({
        url: $scope.topics[$scope.topic][$scope.subTopic],
        dataType: 'html',
        cache: false,
        success: function (data, textStatus, jqXHR) {
          $scope.html = "Unable to download help data for " + $scope.topic;
          if (angular.isDefined(data)) {
            $scope.html = marked(data);
          }
          Core.$apply($scope);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $scope.html = "Unable to download help data for " + $scope.topic;
          Core.$apply($scope);
        }
      })
    }
  }
}
