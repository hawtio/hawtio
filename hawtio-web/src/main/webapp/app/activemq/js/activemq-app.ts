module ActiveMQ {
  var pluginName = 'activemq';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'camel']).config(($routeProvider) => {
            $routeProvider.
                    when('/activemq/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html', controller: BrowseQueueController}).
                    when('/activemq/subscribers', {templateUrl: 'app/activemq/html/subscribers.html', controller: SubscriberGraphController}).
                    when('/activemq/createQueue', {templateUrl: 'app/activemq/html/createQueue.html', controller: DestinationController}).
                    when('/activemq/createTopic', {templateUrl: 'app/activemq/html/createTopic.html', controller: DestinationController}).
                    when('/activemq/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html', controller: DestinationController}).
                    when('/activemq/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html', controller: DestinationController}).
                    when('/activemq/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', controller: Camel.SendMessageController})
          }).
                    run(($location: ng.ILocationService, workspace: Workspace) => {
                      // now lets register the nav bar stuff!
                      var map = workspace.uriValidations;
                      map['activemq/browseQueue'] = () => workspace.isQueue();
                      map['activemq/browseEndpoint'] = () => workspace.isEndpoint();
                      //map['activemq/sendMessage'] = () => workspace.isQueue() || workspace.isTopic() || workspace.isEndpoint();
                      map['activemq/subscribers'] = () => workspace.isActiveMQFolder();
                      map['activemq/createQueue'] = () => workspace.isQueuesFolder();
                      map['activemq/createTopic'] = () => workspace.isTopicsFolder();
                      map['activemq/deleteQueue'] = () => workspace.isQueue();
                      map['activemq/deleteTopic'] = () => workspace.isTopic();

                      workspace.topLevelTabs.push( {
                        content: "Messaging",
                        title: "Manage your message brokers",
                        isValid: () => workspace.treeContainsDomainAndProperties("org.apache.activemq"),
                        href: () => url("#/jmx/attributes?nid=root_org.apache.activemq"),
                        isActive: () => workspace.isLinkActive("activemq")
                      });

                      // add sub level tabs
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-envelope"></i> Browse',
                        title: "Browse the messages on the queue",
                        isValid: () => workspace.isQueue(),
                        href: () => "#/activemq/browseQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-pencil"></i> Send',
                        title: "Send a message to this destination",
                        isValid: () => workspace.isQueue() || workspace.isTopic(),
                        href: () => "#/activemq/sendMessage"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-picture"></i> Diagram',
                        title: "View a diagram of the producers, destinations and consumers",
                        isValid: () => workspace.isActiveMQFolder(),
                        href: () => "#/activemq/subscribers"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Queue',
                        title: "Create a new queue",
                        isValid: () => workspace.isQueuesFolder(),
                        href: () => "#/activemq/createQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Topic',
                        title: "Create a new topic",
                        isValid: () => workspace.isTopicsFolder(),
                        href: () => "#/activemq/createTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Topic',
                        title: "Delete this topic",
                        isValid: () => workspace.isTopic(),
                        href: () => "#/activemq/deleteTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Queue',
                        title: "Delete this queue",
                        isValid: () => workspace.isQueue(),
                        href: () => "#/activemq/deleteQueue"
                      });
                    });

  hawtioPluginLoader.addModule(pluginName);
}
