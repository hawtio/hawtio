module ActiveMQ {
  angular.module('activemq', ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
            $routeProvider.
                    when('/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html', controller: BrowseQueueController}).
                    when('/subscribers', {templateUrl: 'app/activemq/html/subscribers.html', controller: SubscriberGraphController}).
                    when('/createQueue', {templateUrl: 'app/activemq/html/createQueue.html', controller: DestinationController}).
                    when('/createTopic', {templateUrl: 'app/activemq/html/createTopic.html', controller: DestinationController}).
                    when('/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html', controller: DestinationController}).
                    when('/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html', controller: DestinationController})
          }).
                    run(($location: ng.ILocationService, workspace: Workspace) => {
                      // now lets register the nav bar stuff!
                      var map = workspace.uriValidations;
                      map['browseQueue'] = () => workspace.isQueue();
                      map['browseEndpoint'] = () => workspace.isEndpoint();
                      map['sendMessage'] = () => workspace.isQueue() || workspace.isTopic() || workspace.isEndpoint();
                      map['subscribers'] = () => workspace.isActiveMQFolder();
                      map['createQueue'] = () => workspace.isQueuesFolder();
                      map['createTopic'] = () => workspace.isTopicsFolder();
                      map['deleteQueue'] = () => workspace.isQueue();
                      map['deleteTopic'] = () => workspace.isTopic();

                      workspace.topLevelTabs.push( {
                        content: "Messaging",
                        title: "Manage your message brokers",
                        isValid: () => workspace.hasDomainAndProperties("org.apache.activemq"),
                        href: () => url("#/attributes?nid=root_org.apache.activemq"),
                        ngClick: () => {
                          console.log("clicking the Messaging tab");
                          var q = $location.search();
                          q['nid'] = "root_org.apache.activemq";
                          $location.search(q);
                        }
                      });
                    });

  hawtioPluginLoader.addModule('activemq');
}
