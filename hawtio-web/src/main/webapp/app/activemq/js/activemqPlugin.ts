/**
 * @module ActiveMQ
 * @main ActiveMQ
 */
/// <reference path="./activemqHelpers.ts"/>
/// <reference path="../../core/js/corePlugin.ts"/>
/// <reference path="../../core/js/helpRegistry.ts"/>
/// <reference path="../../core/js/preferencesRegistry.ts"/>
module ActiveMQ {

  export var pluginName = 'activemq';

  export var _module = angular.module(pluginName, ['bootstrap', 'ngResource', 'ui.bootstrap.dialog', 'hawtioCore', 'camel', 'hawtio-ui']);
    
  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
            when('/activemq/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html'}).
            when('/activemq/diagram', {templateUrl: 'app/activemq/html/brokerDiagram.html', reloadOnSearch: false}).
            when('/activemq/createDestination', {templateUrl: 'app/activemq/html/createDestination.html'}).
            when('/activemq/createQueue', {templateUrl: 'app/activemq/html/createQueue.html'}).
            when('/activemq/createTopic', {templateUrl: 'app/activemq/html/createTopic.html'}).
            when('/activemq/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html'}).
            when('/activemq/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html'}).
            when('/activemq/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html'}).
            when('/activemq/durableSubscribers', {templateUrl: 'app/activemq/html/durableSubscribers.html'}).
            when('/activemq/jobs', {templateUrl: 'app/activemq/html/jobs.html'}).
            when('/activemq/queues', {templateUrl: 'app/activemq/html/destinations.html'}).
            when('/activemq/topics', {templateUrl: 'app/activemq/html/destinations.html', controller: 'topicsController'})
  }]);

  _module.controller('topicsController', ($scope) => {
      $scope.destinationType = 'topic';
  });

  _module.run(["$location", "workspace", "viewRegistry", "helpRegistry", "preferencesRegistry", "localStorage", (
      $location: ng.ILocationService,
      workspace: Workspace,
      viewRegistry: any,
      helpRegistry: Core.HelpRegistry,
      preferencesRegistry: Core.PreferencesRegistry,
      localStorage: WindowLocalStorage) => {

    var amqJmxDomain = localStorage['activemqJmxDomain'] || "org.apache.activemq";

    viewRegistry['activemq'] = 'app/activemq/html/layoutActiveMQTree.html';
    helpRegistry.addUserDoc('activemq', 'app/activemq/doc/help.md', () => {
      return workspace.treeContainsDomainAndProperties(amqJmxDomain);
    });

    preferencesRegistry.addTab("ActiveMQ", "app/activemq/html/preferences.html", () => {
      return workspace.treeContainsDomainAndProperties(amqJmxDomain);
    });

    workspace.addTreePostProcessor(postProcessTree);

    var onClickRowHandlers = workspace.onClickRowHandlers;

    var onClickFunction = (row)  => {
      var entityName = row.entity.Name;
      var treeElement = $("#activemqtree");
      if(treeElement.length === 0)
      { // We are on the JMX Plugin Tree view
        treeElement = $("#jmxtree")
      }
      if(treeElement.length != 0) {
        var root = <any>treeElement.dynatree("getActiveNode");
        var children = root.getChildren();
        for (var idx in children){
          if(children[idx] && children[idx].data.title === entityName ){
            children[idx].expand(true);
            children[idx].activate();
            break;
          }
        }
      }
    };

    onClickRowHandlers[jmxDomain + "/Queue/folder"] = onClickFunction;
    onClickRowHandlers[jmxDomain + "/Topic/folder"] = onClickFunction;

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
      {field: 'EnqueueCount', displayName: 'Enqueue #'},
      {field: 'DequeueCount', displayName: 'Dequeue #'},
      {field: 'MemoryPercentUsage', displayName: 'Memory %'},
      {field: 'DispatchCount', displayName: 'Dispatch #', visible: false}
    ];
    attributes[jmxDomain + "/Topic/folder"] = [
      {field: 'Name', displayName: 'Name', width: "****"},
      {field: 'ProducerCount', displayName: 'Producer #'},
      {field: 'ConsumerCount', displayName: 'Consumer #'},
      {field: 'EnqueueCount', displayName: 'Enqueue #'},
      {field: 'DequeueCount', displayName: 'Dequeue #'},
      {field: 'MemoryPercentUsage', displayName: 'Memory %'},
      {field: 'DispatchCount', displayName: 'Dispatch #', visible: false}
    ];
    attributes[jmxDomain + "/Consumer/folder"] = [
      {field: 'ConnectionId', displayName: 'Name', width: "**"},
      {field: 'PrefetchSize', displayName: 'Prefetch Size'},
      {field: 'Priority', displayName: 'Priority'},
      {field: 'DispatchedQueueSize', displayName: 'Dispatched Queue #'},
      {field: 'SlowConsumer', displayName: 'Slow ?'},
      {field: 'Retroactive', displayName: 'Retroactive'},
      {field: 'Selector', displayName: 'Selector'}
    ];
    attributes[jmxDomain + "/networkConnectors/folder"] = [
      {field: 'Name', displayName: 'Name', width: "**"},
      {field: 'UserName', displayName: 'User Name'},
      {field: 'PrefetchSize', displayName: 'Prefetch Size'},
      {field: 'ConduitSubscriptions', displayName: 'Conduit Subscriptions?'},
      {field: 'Duplex', displayName: 'Duplex'},
      {field: 'DynamicOnly', displayName: 'Dynamic Only'}
    ];
    attributes[jmxDomain + "/PersistenceAdapter/folder"] = [
      {field: 'IndexDirectory', displayName: 'Index Directory', width: "**"},
      {field: 'LogDirectory', displayName: 'Log Directory', width: "**"}
    ];

    workspace.topLevelTabs.push({
      id: "activemq",
      content: "ActiveMQ",
      title: "Manage your ActiveMQ message brokers",
      isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties(amqJmxDomain),
      href: () => "#/jmx/attributes?tab=activemq",
      isActive: () => workspace.isTopTabActive("activemq")
    });

    // add sub level tabs
    workspace.subLevelTabs.push({
      content: '<i class="icon-envelope"></i> Browse',
      title: "Browse the messages on the queue",
      isValid: (workspace:Workspace) => isQueue(workspace, amqJmxDomain) && workspace.hasInvokeRights(workspace.selection, "browse()"),
      href: () => "#/activemq/browseQueue"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-pencil"></i> Send',
      title: "Send a message to this destination",
      isValid: (workspace:Workspace) => (isQueue(workspace, amqJmxDomain) || isTopic(workspace, amqJmxDomain)) && workspace.hasInvokeRights(workspace.selection, "sendTextMessage(java.util.Map,java.lang.String,java.lang.String,java.lang.String)"),
      href: () => "#/activemq/sendMessage"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-picture"></i> Diagram',
      title: "View a diagram of the producers, destinations and consumers",
      isValid: (workspace:Workspace) =>  workspace.isTopTabActive("activemq") || workspace.selectionHasDomain(amqJmxDomain),
      href: () => "#/activemq/diagram"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-plus"></i> Create',
      title: "Create a new destination",
      isValid: (workspace:Workspace) => isBroker(workspace, amqJmxDomain) && workspace.hasInvokeRights(getBroker(workspace), "addQueue", "addTopic"),
      href: () => "#/activemq/createDestination"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-plus"></i> Create',
      title: "Create a new queue",
      isValid: (workspace:Workspace) => isQueuesFolder(workspace, amqJmxDomain) && workspace.hasInvokeRights(getBroker(workspace), "addQueue"),
      href: () => "#/activemq/createQueue"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-plus"></i> Create',
      title: "Create a new topic",
      isValid: (workspace:Workspace) => isTopicsFolder(workspace, amqJmxDomain) && workspace.hasInvokeRights(getBroker(workspace), "addQueue"),
      href: () => "#/activemq/createTopic"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-remove"></i> Delete Topic',
      title: "Delete this topic",
      isValid: (workspace:Workspace) => isTopic(workspace, amqJmxDomain) && workspace.hasInvokeRights(getBroker(workspace), "removeTopic"),
      href: () => "#/activemq/deleteTopic"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-remove"></i> Delete',
      title: "Delete or purge this queue",
      isValid: (workspace:Workspace) => isQueue(workspace, amqJmxDomain) && workspace.hasInvokeRights(getBroker(workspace), "removeQueue"),
      href: () => "#/activemq/deleteQueue"
    });
    workspace.subLevelTabs.push({
      content: '<i class="icon-list"></i> Durable Subscribers',
      title: "Manage durable subscribers",
      isValid: (workspace:Workspace) => isBroker(workspace, amqJmxDomain),
      href: () => "#/activemq/durableSubscribers"
    });

    workspace.subLevelTabs.push({
        content: '<i class="icon-list"></i> Jobs',
        title: "Manage jobs",
        isValid: (workspace:Workspace) => isJobScheduler(workspace, amqJmxDomain),
        href: () => "#/activemq/jobs"
    });

    workspace.subLevelTabs.push({
        content: '<i class="icon-list"></i> Queues',
        title: "View Queues",
        isValid: (workspace:Workspace) => isBroker(workspace, amqJmxDomain),
        href: () => "#/activemq/queues"
    });

    workspace.subLevelTabs.push({
        content: '<i class="icon-list"></i> Topics',
        title: "View Topics",
        isValid: (workspace:Workspace) => isBroker(workspace, amqJmxDomain),
        href: () => "#/activemq/topics"
    });

    function postProcessTree(tree) {
      var activemq = tree.get(amqJmxDomain);
      setConsumerType(activemq);

      // lets move queue and topic as first children within brokers
      if (activemq) {
        angular.forEach(activemq.children, (broker) => {
          angular.forEach(broker.children, (child) => {
            // lets move Topic/Queue to the front.
            var grandChildren = child.children;
            if (grandChildren) {
              var names = ["Topic", "Queue"];
              angular.forEach(names, (name) => {
                var idx = grandChildren.findIndex(n => n.title === name);
                if (idx > 0) {
                  var old = grandChildren[idx];
                  grandChildren.splice(idx, 1);
                  grandChildren.splice(0, 0, old);
                }
              });
            }
          });
        });
      }
    }

    function setConsumerType(node:Core.Folder) {
      if (node) {
        var parent = node.parent;
        var entries = node.entries;
        if (parent && !parent.typeName && entries) {
          var endpoint = entries["endpoint"];
          if (endpoint === "Consumer" || endpoint === "Producer") {
            //console.log("Setting the typeName on " + parent.title + " to " + endpoint);
            parent.typeName = endpoint;
          }
          var connectorName = entries["connectorName"];
          if (connectorName && !node.icon) {
            // lets default a connector icon
            node.icon = Core.url("/img/icons/activemq/connector.png");
          }
        }
        angular.forEach(node.children, (child) => setConsumerType(child));
      }
    }
  }]);

  hawtioPluginLoader.addModule(pluginName);

  export function getBroker(workspace:Workspace) {
    var answer:Core.Folder = null;
    var selection = workspace.selection;
    if (selection) {
      answer = <Core.Folder> selection.findAncestor((current:Core.Folder) => {
        // log.debug("Checking current: ", current);
        var entries = <any> current.entries;
        if (entries) {
          return (('type' in entries && entries.type === 'Broker') && 'brokerName' in entries && !('destinationName' in entries) && !('destinationType' in entries))
        } else {
          return false;
        }
      });
    }
    return answer;
  }

  export function isQueue(workspace:Workspace, domain) {
    //return workspace.selectionHasDomainAndType(jmxDomain, 'Queue');
    return workspace.hasDomainAndProperties(domain, {'destinationType': 'Queue'}, 4) || workspace.selectionHasDomainAndType(domain, 'Queue');
  }

  export function isTopic(workspace:Workspace, domain) {
    //return workspace.selectionHasDomainAndType(jmxDomain, 'Topic');
    return workspace.hasDomainAndProperties(domain, {'destinationType': 'Topic'}, 4) || workspace.selectionHasDomainAndType(domain, 'Topic');
  }

  export function isQueuesFolder(workspace:Workspace, domain) {
    return workspace.selectionHasDomainAndLastFolderName(domain, 'Queue');
  }

  export function isTopicsFolder(workspace:Workspace, domain) {
    return workspace.selectionHasDomainAndLastFolderName(domain, 'Topic');
  }

  export function isJobScheduler(workspace:Workspace, domain) {
      return workspace.hasDomainAndProperties(domain, {'service': 'JobScheduler'}, 4);
  }

  export function isBroker(workspace:Workspace, domain) {
    if (workspace.selectionHasDomainAndType(domain, 'Broker')) {
      var self = Core.pathGet(workspace, ["selection"]);
      var parent = Core.pathGet(workspace, ["selection", "parent"]);
      return !(parent && (parent.ancestorHasType('Broker') || self.ancestorHasType('Broker')));
    }
    return false;
  }
}
