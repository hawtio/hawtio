function QueueController($scope, workspace) {
  $scope.workspace = workspace;
  $scope.messages = [];

  var populateTable = function (response) {
    var data = response.value;
    $scope.messages = data;
    $scope.$apply();

    $('#grid').dataTable({
      bPaginate: false,
      sDom: 'Rlfrtip',
      bDestroy: true,
      aaData: data,
      aoColumns: [
        { "mDataProp": "JMSMessageID" },
        {
          "sDefaultContent": "",
          "mData": null,
          "mDataProp": "Text"
        },
        { "mDataProp": "JMSCorrelationID" },
        { "mDataProp": "JMSTimestamp" },
        { "mDataProp": "JMSDeliveryMode" },
        { "mDataProp": "JMSReplyTo" },
        { "mDataProp": "JMSRedelivered" },
        { "mDataProp": "JMSPriority" },
        { "mDataProp": "JMSXGroupSeq" },
        { "mDataProp": "JMSExpiration" },
        { "mDataProp": "JMSType" },
        { "mDataProp": "JMSDestination" }
      ]
    });
  };

  $scope.$watch('workspace.selection', function () {
    // TODO could we refactor the get mbean thingy??
    var selection = workspace.selection;
    if (selection) {
      var mbean = selection.objectName;
      if (mbean) {
        var jolokia = workspace.jolokia;

        jolokia.request(
                {type: 'exec', mbean: mbean, operation: 'browse()'},
                onSuccess(populateTable));
      }
    }
  });
}

function CreateDestinationController($scope, workspace) {
  function operationSuccess() {
    $scope.destinationName = "";
    $scope.$apply();
  }

  $scope.createDestination = (name, isQueue) => {
    var jolokia = workspace.jolokia;
    var selection = workspace.selection;
    var folderNames = selection.folderNames;
    if (selection && jolokia && folderNames && folderNames.length > 1) {
      var mbean = "" + folderNames[0] + ":BrokerName=" + folderNames[1] + ",Type=Broker";
      console.log("Creating queue " + isQueue + " of name: " + name + " on mbean");
      var operation;
      if (isQueue) {
        operation = "addQueue(java.lang.String)"
      } else {
        operation = "addTopic(java.lang.String)";
      }
      jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
    }
  };

  $scope.deleteDestination = () => {
    var jolokia = workspace.jolokia;
    var selection = workspace.selection;
    var entries = selection.entries;
    if (selection && jolokia && entries) {
      var domain = selection.domain;
      var brokerName = entries["BrokerName"];
      var name = entries["Destination"];
      var isQueue = "Topic" !== entries["Type"];
      if (domain && brokerName) {
        var mbean = "" + domain + ":BrokerName=" + brokerName + ",Type=Broker";
        console.log("Deleting queue " + isQueue + " of name: " + name + " on mbean");
        var operation;
        if (isQueue) {
          operation = "removeQueue(java.lang.String)"
        } else {
          operation = "removeTopic(java.lang.String)";
        }
        jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
      }
    }
  };
}


function SubscriberGraphController($scope, workspace) {
  $scope.workspace = workspace;
  $scope.nodes = [];
  $scope.links = [];
  $scope.queues = {};
  $scope.topics = {};
  $scope.subscriptions = {};
  $scope.producers = {};

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
                label: destinationName, imageUrl: "/img/activemq/queue.png" });
            } else {
              id = getOrCreate($scope.topics, destinationName, {
                label: destinationName, imageUrl: "/img/activemq/topic.png" });
            }

            // lets lazily register the subscription
            if (!subscriptionId) {
              var subscriptionKey = subscription["ConnectionId"] + ":" + subscription["SubcriptionId"];
              subscription["label"] = subscriptionKey;
              subscription["imageUrl"] = "/img/activemq/listener.gif";
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
                label: destinationName, imageUrl: "/img/activemq/queue.png" });
            } else {
              id = getOrCreate($scope.topics, destinationName, {
                label: destinationName, imageUrl: "/img/activemq/topic.png" });
            }

            // lets lazily register the producer
            if (!producerId) {
              var producerKey = producer["ProducerId"];
              producer["label"] = producerKey;
              producer["imageUrl"] = "/img/activemq/sender.gif";
              producerId = getOrCreate($scope.producers, producerKey, producer);
            }

            $scope.links.push({ source: producerId, target: id });
            // TODO add connections...?
          }
        });
      }
    }
    d3ForceGraph($scope, $scope.nodes, $scope.links);
    $scope.$apply();
  };

  $scope.$watch('workspace.selection', function () {
    var isQueue = true;
    var jolokia = $scope.workspace.jolokia;
    if (jolokia) {
      var selection = $scope.workspace.selection;
      $scope.selectionDetinationName = null;
      if (selection) {
        if (selection.entries) {
          $scope.selectionDetinationName = selection.entries["Destination"];
          isQueue = selection.entries["Type"] !== "Topic";
        } else if (selection.folderNames) {
          isQueue = selection.folderNames.last() !== "Topic";
        }
      }
      $scope.isQueue = isQueue;
      // TODO detect if we're looking at topics
      var typeName;
      if (isQueue) {
        typeName = "Queue";
      } else {
        typeName = "Topic";
      }
      jolokia.request([
        {type: 'read',
          mbean: "org.apache.activemq:Type=Subscription,destinationType=" + typeName + ",*" },
        {type: 'read',
          mbean: "org.apache.activemq:Type=Producer,*"}
      ], onSuccess([populateSubscribers, populateProducers]));
    }
  });
}