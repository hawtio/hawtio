module ActiveMQ {
  var pluginName = 'activemq';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
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
                        href: () => url("#/attributes?nid=root_org.apache.activemq")
                      });

                      // add sub level tabs
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-envelope"></i> Browse',
                        title: "Browse the messages on the queue",
                        isValid: () => workspace.isQueue(),
                        href: () => "#/browseQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-picture"></i> Diagram',
                        title: "View a diagram of the producers, destinations and consumers",
                        isValid: () => workspace.isActiveMQFolder(),
                        href: () => "#/subscribers"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-pencil"></i> Send',
                        title: "Send a message to this destination",
                        isValid: () => workspace.isQueue() || workspace.isTopic(),
                        href: () => "#/sendMessage"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Queue',
                        title: "Create a new queue",
                        isValid: () => workspace.isQueuesFolder(),
                        href: () => "#/createQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Topic',
                        title: "Create a new topic",
                        isValid: () => workspace.isTopicsFolder(),
                        href: () => "#/createTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Topic',
                        title: "Delete this topic",
                        isValid: () => workspace.isTopic(),
                        href: () => "#/deleteTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Queue',
                        title: "Delete this queue",
                        isValid: () => workspace.isQueue(),
                        href: () => "#/deleteQueue"
                      });

                    });

  hawtioPluginLoader.addModule(pluginName);
}
