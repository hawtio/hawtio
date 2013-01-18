module ActiveMQ {
  var pluginName = 'activemq';
  var jmxDomain = 'org.apache.activemq';

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
                      map['activemq/browseQueue'] = () => isQueue(workspace);
                      map['activemq/sendMessage'] = () => isQueue(workspace) || isTopic(workspace);
                      map['activemq/subscribers'] = () => isActiveMQFolder(workspace);
                      map['activemq/createQueue'] = () => isQueuesFolder(workspace) || isBroker(workspace);
                      map['activemq/createTopic'] = () => isTopicsFolder(workspace) || isBroker(workspace);
                      map['activemq/deleteQueue'] = () => isQueue(workspace);
                      map['activemq/deleteTopic'] = () => isTopic(workspace);

                      workspace.topLevelTabs.push( {
                        content: "Messaging",
                        title: "Manage your message brokers",
                        isValid: () => workspace.treeContainsDomainAndProperties("org.apache.activemq"),
                        href: () => url("#/jmx/attributes?tab=messaging"),
                        isActive: () => workspace.isTopTabActive("messaging")
                      });

                      // add sub level tabs
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-envelope"></i> Browse',
                        title: "Browse the messages on the queue",
                        isValid: () => isQueue(workspace),
                        href: () => "#/activemq/browseQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-pencil"></i> Send',
                        title: "Send a message to this destination",
                        isValid: () => isQueue(workspace) || isTopic(workspace),
                        href: () => "#/activemq/sendMessage"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-picture"></i> Diagram',
                        title: "View a diagram of the producers, destinations and consumers",
                        isValid: () => isActiveMQFolder(workspace),
                        href: () => "#/activemq/subscribers"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Queue',
                        title: "Create a new queue",
                        isValid: () => isQueuesFolder(workspace) || isBroker(workspace),
                        href: () => "#/activemq/createQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Topic',
                        title: "Create a new topic",
                        isValid: () => isTopicsFolder(workspace) || isBroker(workspace),
                        href: () => "#/activemq/createTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Topic',
                        title: "Delete this topic",
                        isValid: () => isTopic(workspace),
                        href: () => "#/activemq/deleteTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Queue',
                        title: "Delete this queue",
                        isValid: () => isQueue(workspace),
                        href: () => "#/activemq/deleteQueue"
                      });
                    });

  hawtioPluginLoader.addModule(pluginName);

  export function isQueue(workspace:Workspace) {
    //return workspace.selectionHasDomainAndType(jmxDomain, 'Queue');
    return workspace.hasDomainAndProperties(jmxDomain, {'destinationType': 'Queue'}, 4) || workspace.selectionHasDomainAndType(jmxDomain, 'Queue');
  }

  export function isTopic(workspace:Workspace) {
    //return workspace.selectionHasDomainAndType(jmxDomain, 'Topic');
    return workspace.hasDomainAndProperties(jmxDomain, {'destinationType': 'Topic'}, 4) || workspace.selectionHasDomainAndType(jmxDomain, 'Topic');
  }

  export function isQueuesFolder(workspace:Workspace) {
    return workspace.selectionHasDomainAndLastFolderName(jmxDomain, 'Queue');
  }

  export function isTopicsFolder(workspace:Workspace) {
    return workspace.selectionHasDomainAndLastFolderName(jmxDomain, 'Topic');
  }

  export function isBroker(workspace:Workspace) {
    if (workspace.selectionHasDomainAndType(jmxDomain, 'Broker')) {
      var parent = workspace.selection.parent;
      return !(parent && parent.ancestorHasType('Broker'));
    }
    return false;
  }

  export function isActiveMQFolder(workspace:Workspace) {
    return workspace.hasDomainAndProperties(jmxDomain);
  }
}
