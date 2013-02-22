module ActiveMQ {
    export function SubscriberGraphController($scope, $element, workspace:Workspace, jolokia) {
      $scope.nodes = [];
      $scope.links = [];
      $scope.queues = {};
      $scope.topics = {};
      $scope.subscriptions = {};
      $scope.producers = {};
      $scope.networks = {};

      $scope.parentHeight = 0;
      $scope.parentWidth = 0;

      function matchesSelection(destinationName) {
        var selectionDetinationName = $scope.selectionDetinationName;
        return !selectionDetinationName || destinationName === selectionDetinationName;
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

      var populateSubscribers = function (response) {
        var data = response.value;
        for (var key in data) {
          var subscription = data[key];
          var destinationNameText = subscription["DestinationName"];
          if (destinationNameText) {
            var subscriptionId = null;
            var destinationNames = destinationNameText.split(",");
            destinationNames.forEach((destinationName) => {
              var id = null;
              var isQueue = !subscription["DestinationTopic"];
              if (isQueue === $scope.isQueue && matchesSelection(destinationName)) {
                if (isQueue) {
                  id = getOrCreate($scope.queues, destinationName, {
                    label: destinationName, imageUrl: url("/app/activemq/img/queue.png") });
                } else {
                  id = getOrCreate($scope.topics, destinationName, {
                    label: destinationName, imageUrl: url("/app/activemq/img/topic.png") });
                }

                // lets lazily register the subscription
                if (!subscriptionId) {
                  var subscriptionKey = subscription["ConnectionId"] + ":" + subscription["SubcriptionId"];
                  subscription["label"] = subscriptionKey;
                  subscription["imageUrl"] = url("/app/activemq/img/listener.gif");
                  subscriptionId = getOrCreate($scope.subscriptions, subscriptionKey, subscription);
                }

                $scope.links.push({ source: id, target: subscriptionId });
                // TODO add connections...?
              }
            });
          }
        }
      };

      var populateProducers = function (response) {
        var data = response.value;
        for (var key in data) {
          var producer = data[key];
          var destinationNameText = producer["DestinationName"];
          if (destinationNameText) {
            var producerId = null;
            var destinationNames = destinationNameText.split(",");
            destinationNames.forEach((destinationName) => {
              var id = null;
              var isQueue = producer["DestinationQueue"];
              if (isQueue === $scope.isQueue && matchesSelection(destinationName)) {
                if (isQueue) {
                  id = getOrCreate($scope.queues, destinationName, {
                    label: destinationName, imageUrl: url("/app/activemq/img/queue.png") });
                } else {
                  id = getOrCreate($scope.topics, destinationName, {
                    label: destinationName, imageUrl: url("/app/activemq/img/topic.png") });
                }

                // lets lazily register the producer
                if (!producerId) {
                  var producerKey = producer["ProducerId"];
                  producer["label"] = producerKey;
                  producer["imageUrl"] = url("/app/activemq/img/sender.gif");
                  producerId = getOrCreate($scope.producers, producerKey, producer);
                }

                $scope.links.push({ source: producerId, target: id });
                // TODO add connections...?
              }
            });
          }
        }

        Core.d3ForceGraph($scope, $scope.nodes, $scope.links, $element);
        $scope.$apply();
      };

      var populateNetworks = function (response) {
        var data = response.value;
        for (var key in data) {
          var bridge = data[key];
          var localId = getOrCreate($scope.networks, bridge["LocalBrokerName"], {
            label: bridge["LocalBrokerName"], imageUrl: url("/app/activemq/img/message_broker.png") });
          var remoteId = getOrCreate($scope.networks, bridge["RemoteBrokerName"], {
            label: bridge["RemoteBrokerName"], imageUrl: url("/app/activemq/img/message_broker.png") });

          $scope.links.push({ source: localId, target: remoteId });
        }

        Core.d3ForceGraph($scope, $scope.nodes, $scope.links, $element);
        $scope.$apply();
      };

      $scope.updateGraph = () => {
        var canvas = $("#canvas");
        var parent = canvas.parent();
        var parentWidth = parent.width();
        var parentHeight = parent.height();

        // console.log("Parent width: " + parentWidth + " parent height: " + parentHeight);
        var canvasWidth = canvas.width();
        var canvasHeight = canvas.height();
        // console.log("Canvas width: " + canvasWidth + " canvas height: " + canvasHeight);

        if (canvasHeight !== parentHeight || canvasWidth !== parentWidth) {
          // console.log("force resize");
          Core.d3ForceGraph($scope, $scope.nodes, $scope.links, $element);
        }
      }

      $scope.$watch($scope.updateGraph);

      $scope.$watch('workspace.selection', function () {
        if (workspace.moveIfViewInvalid()) return;

        $scope.nodes = [];
        $scope.links = [];
        var isQueue = false;
        var isTopic = false;
        if (jolokia) {
          var selection = workspace.selection;
          $scope.selectionDetinationName = null;
          var typeName = null;
          if (selection) {
            typeName = selection.typeName || selection.title;
            if (typeName) {
              isQueue = typeName === "Queue";
              isTopic = typeName === "Topic";
            }
            $scope.selectionDetinationName = selection.entries["Destination"];

            /*
            if (!selection.isFolder()) {
              $scope.selectionDetinationName = selection.entries["Destination"];
              //var typeName = selection.entries["Type"];
              typeName = selection.typeName;
              isQueue = typeName === "Queue";
              isTopic = typeName === "Topic";
            } else if (selection.folderNames) {
              isQueue = selection.folderNames.last() === "Queue";
              isTopic = selection.folderNames.last() === "Topic";
            }
            */
          }
          $scope.isQueue = isQueue;
          $scope.isTopic = isTopic;
          if (!typeName) {
            if (isQueue) {
              typeName = "Queue";
            } else {
              typeName = "Topic";
            }
          }
          if (isQueue || isTopic) {
            jolokia.request([
              {type: 'read',
                mbean: "org.apache.activemq:Type=Subscription,destinationType=" + typeName + ",*" },
              {type: 'read',
                mbean: "org.apache.activemq:Type=Producer,*"}
            ], onSuccess([populateSubscribers, populateProducers]));
          } else {
            jolokia.request({type: 'read', mbean: "org.apache.activemq:Type=NetworkBridge,*"}, onSuccess(populateNetworks));
          }
        }
      });
    }
}
