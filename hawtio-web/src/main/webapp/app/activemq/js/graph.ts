module ActiveMQ {
  export function SubscriberGraphController($scope, $element, $timeout, workspace:Workspace, jolokia) {
    $scope.nodes = [];
    $scope.links = [];
    $scope.queues = {};
    $scope.topics = {};
    $scope.subscriptions = {};
    $scope.producers = {};
    $scope.networks = {};

    $scope.parentHeight = 0;
    $scope.parentWidth = 0;

    $scope.updateGraph = () => {
      var canvas = $("#canvas");
      var parent = canvas.parent();
      var parentWidth = parent.width();
      var parentHeight = parent.height();

      // console.log("Parent width: " + parentWidth + " parent height: " + parentHeight);
      var canvasWidth = canvas.width();
      var canvasHeight = canvas.height();
      // console.log("Canvas width: " + canvasWidth + " canvas height: " + canvasHeight);

      // lets try avoid too many layouts - lets only do it when we really need to!
      if ((canvasHeight !== parentHeight || canvasWidth !== parentWidth) &&
              (canvasHeight != $scope.lastCanvasHeight || canvasWidth != $scope.lastCanvasWidth)
              && workspace.selection && $scope.nodes.length) {
        console.log("force resize");
        layoutGraph();
      }
    };

    // TODO I don't think this does what we need? maybe this code should be replaced by watching the
    // size of the $element instead so it can re-layout the graph when the window size changes?
    $scope.$watch($scope.updateGraph);

    $scope.$watch('workspace.selection', function (newValue) {
      if (workspace.moveIfViewInvalid()) return;
      $timeout(reloadData, 50);
    });

    function reloadData() {
      var selection = workspace.selection;
      console.log("loading graph data for selection " + selection);
      $scope.nodes = [];
      $scope.links = [];
      var isQueue = false;
      var isTopic = false;
      if (jolokia && selection) {
        $scope.selectionDestinationName = null;
        var typeName = nodeTypeName(selection);
        if (typeName) {
          isQueue = typeName === "Queue";
          isTopic = typeName === "Topic";
        }
        $scope.selectionDestinationName = selection.entries["Destination"] || selection.title;
        $scope.isQueue = isQueue;
        $scope.isTopic = isTopic;
        if (!typeName) {
          if (isQueue) {
            typeName = "Queue";
          } else {
            typeName = "Topic";
          }
        }
        //var options = {silent: true, error: false};
        var options = {};
        //console.log("isQueue " + isQueue + " isTopic " + isTopic);
        var brokerFolder = findBrokerFolder(selection);
        if (isQueue || isTopic) {
          // lets find the consumers which may be children
          var children = selection.children;
          if (children && children.length) {
            var consumerFolder = children[0];
            // lets assume children are consumers ;)
            loadConsumers(isQueue, $scope.selectionDestinationName, consumerFolder.children);
          }
          if (brokerFolder) {
            angular.forEach(brokerFolder.children, (childFolder) => {
              var title = (childFolder.title || "").toLowerCase();
              if (title.indexOf("producer") >= 0) {
                loadProducers(isQueue, $scope.selectionDestinationName, childFolder.children);
              }
            });
          }
        } else {
          // lets find the network connectors if there are any
          if (brokerFolder) {
            angular.forEach(brokerFolder.children, (childFolder) => {
              var title = (childFolder.title || "").toLowerCase();
              if (title.indexOf("networkconnector") >= 0) {
                loadNetworkConnectors(childFolder.children);
              }
            });
          }
        }
        layoutGraph();
        /*
         if (isQueue || isTopic) {
         jolokia.request([
         {type: 'read',
         mbean: "org.apache.activemq:Type=Subscription,destinationType=" + typeName + ",*" },
         {type: 'read',
         mbean: "org.apache.activemq:Type=Producer,*"}
         // there may not be any producers so be silent if no mbeans exists
         ], onSuccess([populateSubscribers, populateProducers], options));
         } else {
         // the network bridge is optional and may not be in use, so do not barf on error
         jolokia.request({type: 'read', mbean: "org.apache.activemq:Type=NetworkBridge,*"}, onSuccess(populateNetworks, options));
         }
         */
      }
    }


    function loadConsumers(isQueue, destinationName, folderArray) {
      angular.forEach(folderArray, (folder) => {
        var children = folder.children;
        if (children && children.length) {
          return loadConsumers(isQueue, destinationName, children);
        } else {
          var id = null;
          if (isQueue) {
            id = getOrCreate($scope.queues, destinationName, {
              label: destinationName, imageUrl: url("/app/activemq/img/queue.png") });
          } else {
            id = getOrCreate($scope.topics, destinationName, {
              label: destinationName, imageUrl: url("/app/activemq/img/topic.png") });
          }
          var entries = folder.entries;
          if (entries) {
            var subscriptionKey = entries["consumerId"] || entries["connectionId"] || entries["subcriptionId"];
            var subscriptionId = getOrCreate($scope.subscriptions, subscriptionKey, {
              label: subscriptionKey, imageUrl: url("/app/activemq/img/listener.gif")
            });
          }

          $scope.links.push({ source: id, target: subscriptionId });
        }
      });
    }

    function loadProducers(queueProducers, destinationName, folderArray) {
      angular.forEach(folderArray, (folawtioder) => {
        var children = folder.children;
        if (children && children.length) {
          loadProducers(queueProducers, destinationName, children);
        } else {
          var entries = folder.entries;
          if (entries) {
            var producerDestinationName = entries["destinationName"] || entries["DestinationName"];
            if (!producerDestinationName) {
              // lets query it instead
              var mbean = folder.objectName;
              if (mbean) {
                var response = jolokia.request({type: 'read', mbean: mbean}, onSuccess(null));
                var answer = response.value;
                var destinationNameAttribute = answer["DestinationName"];
                var isQueue = answer["DestinationQueue"];
                if (queueProducers !== isQueue) {
                  //console.log("Ignored producer " + JSON.stringify(answer) + " as isQueue " + isQueue + " when wanted queues: " + queueProducers);
                } else if (matchesSelection(destinationNameAttribute)) {
                  loadProducer(queueProducers, destinationName, folder);
                }
              }
            } else if (matchesSelection(producerDestinationName)) {
              loadProducer(queueProducers, destinationName, folder);
            }
          }
        }
      });
    }

    function loadProducer(isQueue, destinationName, folder) {
      var entries = folder ? folder.entries : null;
      if (entries) {
        var id = null;
        if (isQueue) {
          id = getOrCreate($scope.queues, destinationName, {
            label: destinationName, imageUrl: url("/app/activemq/img/queue.png") });
        } else {
          id = getOrCreate($scope.topics, destinationName, {
            label: destinationName, imageUrl: url("/app/activemq/img/topic.png") });
        }
        var producerKey = entries["producerId"] || entries["connectionId"];
        var producerId = getOrCreate($scope.producers, producerKey, {
          label: producerKey, imageUrl: url("/app/activemq/img/sender.gif")
        });
        $scope.links.push({ source: producerId, target: id });
      }
    }

    function loadNetworkConnectors(folders) {
      angular.forEach(folders, (folder) => {
        var children = folder.children;
        if (children && children.length) {
          loadNetworkConnectors(children);
        } else {
          var mbean = folder.objectName;
          if (mbean) {
            var response = jolokia.request({type: 'read', mbean: mbean}, onSuccess(null));
            var answer = response.value;
            if (answer) {
              var localBrokerName = answer["LocalBrokerName"];
              var remoteBrokerName = answer["RemoteBrokerName"];
              if (localBrokerName && remoteBrokerName) {
                var localId = getOrCreate($scope.networks, localBrokerName, {
                  label: localBrokerName, imageUrl: url("/app/activemq/img/message_broker.png") });
                var remoteId = getOrCreate($scope.networks, remoteBrokerName, {
                  label: remoteBrokerName, imageUrl: url("/app/activemq/img/message_broker.png") });

                $scope.links.push({ source: localId, target: remoteId });
              }
            }
          }
        }
      });
    }

    function layoutGraph() {
      // lets cache the previous size to avoid unncessary layouts
      var canvas = $("#canvas");
      var canvasWidth = canvas.width();
      var canvasHeight = canvas.height();
      $scope.lastCanvasWidth = canvasWidth;
      $scope.lastCanvasHeight = canvasHeight;

      console.log("about to layout " + $scope.nodes.length + " nodes");
      Core.d3ForceGraph($scope, $scope.nodes, $scope.links, $element);
      Core.$apply($scope);
    }

    /**
     * Finds the broker node in the JMX tree
     */
    function findBrokerFolder(selection) {
      var answer = null;
      if (selection) {
        if (selection.parent) {
          answer = findBrokerFolder(selection.parent);
        }
        if (!answer && selection.typeName === "Broker") {
          answer = selection;
        }
      }
      return answer;
    }

    function nodeTypeName(selection) {
      var typeName = null;
      if (selection) {
        typeName = selection.entries["destinationType"] || selection.typeName || selection.title;
      }
      return typeName;
    }

    function matchesSelection(destinationName) {
      var selectionDestinationName = $scope.selectionDestinationName;
      return !selectionDestinationName || destinationName === selectionDestinationName;
    }

    function getOrCreate(container, key, defaultObject) {
      var value = container[key];
      var id;
      if (!value) {
        container[key] = defaultObject;
        id = $scope.nodes.length;
        defaultObject["id"] = id;
        $scope.nodes.push(defaultObject);
      } else {
        id = value["id"];
      }
      return id;
    }
  }
}
