module ActiveMQ {
  export function DurableSubscriberController($scope, workspace:Workspace, jolokia) {

      $scope.refresh = loadTable;

      $scope.durableSubscribers = [];

      $scope.tempData = [];

      $scope.createSubscriberDialog = new Core.Dialog();
      $scope.deleteSubscriberDialog = new Core.Dialog();
      $scope.showSubscriberDialog = new Core.Dialog();

      $scope.topicName = '';
      $scope.clientId = '';
      $scope.subscriberName = '';
      $scope.subSelector = '';

      $scope.gridOptions = {
        selectedItems: [],
        data: 'durableSubscribers',
        displayFooter: false,
        showFilter: false,
        showColumnMenu: true,
        enableCellSelection: false,
        enableColumnResize: true,
        enableColumnReordering: true,
        selectWithCheckboxOnly: false,
        showSelectionCheckbox: false,
        multiSelect: false,
        displaySelectionCheckbox : false, // old pre 2.0 config!
        filterOptions: {
          filterText: ''
        },
        maintainColumnRatios: false,
        columnDefs: [
          {
              field: 'destinationName',
              displayName: 'Topic',
              width: '30%'
          },
          {
            field: 'clientId',
            displayName: 'Client ID',
            width: '30%'
          },
          {
            field: 'consumerId',
            displayName: 'Consumer ID',
            cellTemplate: '<div class="ngCellText"><span ng-hide="row.entity.status != \'Offline\'">{{row.entity.consumerId}}</span><a ng-show="row.entity.status != \'Offline\'" ng-click="openSubscriberDialog(row)">{{row.entity.consumerId}}</a></div>',
            width: '30%'
          },
          {
            field: 'status',
            displayName: 'Status',
            width: '10%'
          }
        ]
      };

      $scope.doCreateSubscriber = (clientId, subscriberName, topicName, subSelector) => {
          $scope.createSubscriberDialog.close();
          $scope.clientId = clientId;
          $scope.subscriberName = subscriberName;
          $scope.topicName = topicName;
          $scope.subSelector = subSelector;
          if (Core.isBlank($scope.subSelector)) {
            $scope.subSelector = null;
          }
          var mbean = getBrokerMBean(jolokia);
          if (mbean) {
              jolokia.execute(mbean, "createDurableSubscriber(java.lang.String, java.lang.String, java.lang.String, java.lang.String)", $scope.clientId, $scope.subscriberName, $scope.topicName, $scope.subSelector, onSuccess(function() {
                  notification('success', "Created durable subscriber " + clientId);
                  $scope.clientId = '';
                  $scope.subscriberName = '';
                  $scope.topicName = '';
                  $scope.subSelector = '';
                  loadTable();
              }));
          } else {
              notification("error", "Could not find the Broker MBean!");
          }
      }

      $scope.deleteSubscribers = () => {
        var mbean = getBrokerMBean(jolokia);
        if (mbean) {
            jolokia.execute(mbean, "destroyDurableSubscriber(java.lang.String, java.lang.String)", $scope.showSubscriberDialog.subscriber.ClientId, $scope.showSubscriberDialog.subscriber.SubscriptionName, onSuccess(function() {
                $scope.showSubscriberDialog.close();
                notification('success', "Deleted durable subscriber");
                loadTable();
            }));
        } else {
            notification("error", "Could not find the Broker MBean!");
        }
      };

    $scope.openSubscriberDialog = (subscriber) => {
      jolokia.request({type: "read", mbean: subscriber.entity._id}, onSuccess((response) => {
        $scope.showSubscriberDialog.subscriber = response.value;
        $scope.showSubscriberDialog.subscriber.Status =  subscriber.entity.status;
        console.log("Subscriber is now " + $scope.showSubscriberDialog.subscriber);
        Core.$apply($scope);

        // now lets start opening the dialog
        setTimeout(() => {
          $scope.showSubscriberDialog.open();
          Core.$apply($scope);
        }, 100);
      }));
    };

    $scope.topicNames = (completionText) => {
      var topicsFolder = getSelectionTopicsFolder(workspace);
      return (topicsFolder) ? topicsFolder.children.map(n => n.title) : [];
    };


    $scope.$watch('workspace.selection', function () {
        if (workspace.moveIfViewInvalid()) return;

        // lets defer execution as we may not have the selection just yet
        setTimeout(loadTable, 50);
      });

      function loadTable() {
        var mbean = getBrokerMBean(jolokia);
        if (mbean) {
            $scope.durableSubscribers = []
            jolokia.request({type: "read", mbean: mbean, attribute: ["DurableTopicSubscribers"]}, onSuccess( (response) => populateTable(response, "DurableTopicSubscribers", "Active")));
            jolokia.request({type: "read", mbean: mbean, attribute: ["InactiveDurableTopicSubscribers"]}, onSuccess( (response) => populateTable(response, "InactiveDurableTopicSubscribers", "Offline")));
        }
      }

      function populateTable(response, attr, status) {
          var data = response.value;
          log.debug("Got data: ", data);
          $scope.durableSubscribers.push.apply($scope.durableSubscribers, data[attr].map(o => {
              var objectName = o["objectName"];
              var entries = Core.objectNameProperties(objectName);
              if ( !('objectName' in o)) {
                entries = Object.extended(o['keyPropertyList']).clone();
              }
              entries["_id"] = objectName;
              entries["status"] = status;
              return entries;
          }));

          Core.$apply($scope);
      }

      function getBrokerMBean(jolokia) {
        var mbean = null;
        var selection = workspace.selection;
        if (selection && isBroker(workspace) && selection.objectName) {
          return selection.objectName;
        }
        var folderNames = selection.folderNames;
        //if (selection && jolokia && folderNames && folderNames.length > 1) {
        var parent = selection ? selection.parent : null;
        if (selection && parent && jolokia && folderNames && folderNames.length > 1) {
          mbean = parent.objectName;

          // we might be a destination, so lets try one more parent
          if (!mbean && parent) {
            mbean = parent.parent.objectName;
          }
          if (!mbean) {
            mbean = "" + folderNames[0] + ":BrokerName=" + folderNames[1] + ",Type=Broker";
          }
        }
        return mbean;
      }

  }
}
