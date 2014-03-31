/**
 * @module Core
 */
module Core {
  export function HelpController($scope, $routeParams, marked, helpRegistry, branding) {

    $scope.branding = branding;
    $scope.topics = helpRegistry.getTopics();

    if ('topic' in $routeParams) {
      $scope.topic = $routeParams['topic'];
    } else {
      $scope.topic = 'index';
    }

    if ('subtopic' in $routeParams) {
      $scope.subTopic = $routeParams['subtopic'];
    } else {
      $scope.subTopic = Object.extended($scope.topics[$scope.topic]).keys().first();
    }

    log.debug("topic: ", $scope.topic, " subtopic: ", $scope.subTopic);

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

    $scope.sectionLink = (section) => {
     var topic = section.topic || "";
      var subTopic = section.subTopic || "";
      var link = Core.pathGet(helpRegistry.topics, [topic, subTopic]);
      if (link && link.indexOf("#") >= 0) {
        return link;
      } else {
        return "#/help/" + topic + "/" + subTopic;
      }  
    };

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
