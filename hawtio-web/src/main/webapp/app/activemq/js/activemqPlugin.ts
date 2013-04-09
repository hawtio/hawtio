module ActiveMQ {
  var pluginName = 'activemq';
  var jmxDomain = 'org.apache.activemq';

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'camel']).config(($routeProvider) => {
            $routeProvider.
                    when('/activemq/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html'}).
                    when('/activemq/subscribers', {templateUrl: 'app/activemq/html/subscribers.html'}).
                    when('/activemq/createQueue', {templateUrl: 'app/activemq/html/createQueue.html'}).
                    when('/activemq/createTopic', {templateUrl: 'app/activemq/html/createTopic.html'}).
                    when('/activemq/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html'}).
                    when('/activemq/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html'}).
                    when('/activemq/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html'})
          }).
                    run(($location: ng.ILocationService, workspace: Workspace, viewRegistry) => {

                      viewRegistry['activemq'] = 'app/activemq/html/layoutActiveMQTree.html';

                      // register default attribute views
                      var attributes = workspace.attributeColumnDefs;
                      attributes[jmxDomain + "/Broker/folder"] = [
                        {field: 'BrokerName', displayName: 'Name', width: "**"},
                        {field: 'TotalProducerCount', displayName: 'Producer #'},
                        {field: 'TotalConsumerCount', displayName: 'Consumer #'},
                        {field: 'StorePercentUsage', displayName: 'Store %'},
                        {field: 'TempPercentUsage', displayName: 'Temp %'},
                        {field: 'MemoryPercentUsage', displayName: 'Memory %'},
                        {field: 'TotalEnqueueCount', displayName: 'Enqueue #'},
                        {field: 'TotalDequeueCount', displayName: 'Dequeue #'}
                      ];
                      attributes[jmxDomain + "/Queue/folder"] = [
                        {field: 'Name', displayName: 'Name', width: "***"},
                        {field: 'QueueSize', displayName: 'Queue Size'},
                        {field: 'ProducerCount', displayName: 'Producer #'},
                        {field: 'ConsumerCount', displayName: 'Consumer #'},
                        {field: 'MemoryPercentUsage', displayName: 'Memory %'},
                        {field: 'EnqueueCount', displayName: 'Enqueue #', visible: false},
                        {field: 'DequeueCount', displayName: 'Dequeue #', visible: false},
                        {field: 'DispatchCount', displayName: 'Dispatch #', visible: false}
                      ];
                      attributes[jmxDomain + "/Topic/folder"] = [
                        {field: 'Name', displayName: 'Name', width: "****"},
                        {field: 'ProducerCount', displayName: 'Producer #'},
                        {field: 'ConsumerCount', displayName: 'Consumer #'},
                        {field: 'EnqueueCount', displayName: 'Enqueue #'},
                        {field: 'DequeueCount', displayName: 'Dequeue #'},
                        {field: 'MemoryPercentUsage', displayName: 'Memory %'},
                        {field: 'DispatchCount', displayName: 'Dispatch Count', visible: false}
                      ];

                      workspace.topLevelTabs.push( {
                        content: "ActiveMQ",
                        title: "Manage your ActiveMQ message brokers",
                        isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties("org.apache.activemq"),
                        href: () => "#/jmx/attributes?tab=activemq",
                        isActive: () => workspace.isTopTabActive("activemq")
                      });

                      // add sub level tabs
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-envelope"></i> Browse',
                        title: "Browse the messages on the queue",
                        isValid: (workspace: Workspace) => isQueue(workspace),
                        href: () => "#/activemq/browseQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-pencil"></i> Send',
                        title: "Send a message to this destination",
                        isValid: (workspace: Workspace) => isQueue(workspace) || isTopic(workspace),
                        href: () => "#/activemq/sendMessage"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-picture"></i> Diagram',
                        title: "View a diagram of the producers, destinations and consumers",
                        isValid: (workspace: Workspace) => isActiveMQFolder(workspace),
                        href: () => "#/activemq/subscribers"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Queue',
                        title: "Create a new queue",
                        isValid: (workspace: Workspace) => isQueuesFolder(workspace) || isBroker(workspace),
                        href: () => "#/activemq/createQueue"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-plus"></i> Create Topic',
                        title: "Create a new topic",
                        isValid: (workspace: Workspace) => isTopicsFolder(workspace) || isBroker(workspace),
                        href: () => "#/activemq/createTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Topic',
                        title: "Delete this topic",
                        isValid: (workspace: Workspace) => isTopic(workspace),
                        href: () => "#/activemq/deleteTopic"
                      });
                      workspace.subLevelTabs.push( {
                        content: '<i class="icon-remove"></i> Delete Queue',
                        title: "Delete this queue",
                        isValid: (workspace: Workspace) => isQueue(workspace),
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
