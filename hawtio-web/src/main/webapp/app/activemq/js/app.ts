module ActiveMQ {
  angular.module('activemq', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
            $routeProvider.
                    when('/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html', controller: BrowseQueueController}).
                    when('/subscribers', {templateUrl: 'app/activemq/html/subscribers.html', controller: SubscriberGraphController}).
                    when('/createQueue', {templateUrl: 'app/activemq/html/createQueue.html', controller: DestinationController}).
                    when('/createTopic', {templateUrl: 'app/activemq/html/createTopic.html', controller: DestinationController}).
                    when('/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html', controller: DestinationController}).
                    when('/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html', controller: DestinationController})
          });
}
