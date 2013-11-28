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
        enableColumnResize: true,
        enableColumnReordering: true,
        filterOptions: {
          filterText: ''
        },
        selectWithCheckboxOnly: false,
        showSelectionCheckbox: false,
        maintainColumnRatios: false,
        columnDefs: [
          {
            field: 'clientId',
            displayName: 'Client ID',
            width: '45%'
          },
          {
            field: 'consumerId',
            displayName: 'Consumer ID',
            cellTemplate: '<div class="ngCellText"><a ng-click="openSubscriberDialog(row)">{{row.entity.consumerId}}</a></div>',
            width: '45%'
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
          var selection = workspace.selection;
          var mbean = selection.objectName;
          if (mbean && selection) {
              var selectedItems = $scope.gridOptions.selectedItems;
              angular.forEach(selectedItems, (item, idx) => {
                  alert("deleting " + item.clientId);
              });
          }
      };

      $scope.openSubscriberDialog = (subscriber) => {
          jolokia.request({type: "read", mbean: subscriber.entity._id, attribute:["SubscriptionName"]}, onSuccess( (response) => {
             $scope.showSubscriberDialog.subscriber = response.value;

          }));
          $scope.showSubscriberDialog.open();
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
          $scope.durableSubscribers.push.apply($scope.durableSubscribers, data[attr].map(o => {
              var objectName = o["objectName"];
              var entries = Core.objectNameProperties(objectName);
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
