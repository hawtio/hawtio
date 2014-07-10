/// <reference path="activemqPlugin.ts"/>
module ActiveMQ {
  export var BrowseQueueController = _module.controller("ActiveMQ.BrowseQueueController", ["$scope", "workspace", "jolokia", "localStorage", '$location', "activeMQMessage", ($scope, workspace:Workspace, jolokia, localStorage, location, activeMQMessage) => {

    $scope.searchText = '';

    $scope.messages = [];
    $scope.headers = {};
    $scope.mode = 'text';

    $scope.deleteDialog = false;
    $scope.moveDialog = false;

    $scope.gridOptions = {
      selectedItems: [],
      data: 'messages',
      displayFooter: false,
      showFilter: false,
      showColumnMenu: true,
      enableColumnResize: true,
      enableColumnReordering: true,
      filterOptions: {
        filterText: ''
      },
      selectWithCheckboxOnly: true,
      showSelectionCheckbox: true,
      maintainColumnRatios: false,
      columnDefs: [
        {
          field: 'JMSMessageID',
          displayName: 'Message ID',
          cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.JMSMessageID}}</a></div>',
          // for ng-grid
          width: '34%'
          // for hawtio-datatable
          // width: "22em"
        },
        {
          field: 'JMSType',
          displayName: 'Type',
          width: '10%'
        },
        {
          field: 'JMSPriority',
          displayName: 'Priority',
          width: '7%'
        },
        {
          field: 'JMSTimestamp',
          displayName: 'Timestamp',
          width: '19%'
        },
        {
          field: 'JMSExpiration',
          displayName: 'Expires',
          width: '10%'
        },
        {
          field: 'JMSReplyTo',
          displayName: 'Reply To',
          width: '10%'
        },
        {
          field: 'JMSCorrelationID',
          displayName: 'Correlation ID',
          width: '10%'
        }
      ]
    };

    $scope.showMessageDetails = false;

    var ignoreColumns = ["PropertiesText", "BodyPreview", "Text"];
    var flattenColumns = ["BooleanProperties", "ByteProperties", "ShortProperties", "IntProperties", "LongProperties", "FloatProperties",
      "DoubleProperties", "StringProperties"];

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets defer execution as we may not have the selection just yet
      setTimeout(loadTable, 50);
    });

    $scope.openMessageDialog = (message) => {
      ActiveMQ.selectCurrentMessage(message, "JMSMessageID", $scope);
      if ($scope.row) {
        $scope.mode = CodeEditor.detectTextFormat($scope.row.Text);
        $scope.showMessageDetails = true;
      }
    };

    $scope.refresh = loadTable;

    ActiveMQ.decorate($scope);

      $scope.moveMessages = () => {
          var selection = workspace.selection;
          var mbean = selection.objectName;
          if (mbean && selection) {
              var selectedItems = $scope.gridOptions.selectedItems;
              $scope.message = "Moved " + Core.maybePlural(selectedItems.length, "message" + " to " + $scope.queueName);
              var operation = "moveMessageTo(java.lang.String, java.lang.String)";
              angular.forEach(selectedItems, (item, idx) => {
                  var id = item.JMSMessageID;
                  if (id) {
                      var callback = (idx + 1 < selectedItems.length) ? intermediateResult : moveSuccess;
                      jolokia.execute(mbean, operation, id, $scope.queueName, onSuccess(callback));
                  }
              });
          }
      };

      $scope.resendMessage = () => {
          var selection = workspace.selection;
          var mbean = selection.objectName;
          if (mbean && selection) {
              var selectedItems = $scope.gridOptions.selectedItems;
              //always assume a single message
              activeMQMessage.message = selectedItems[0];
              location.path('activemq/sendMessage');
          }
      };

    $scope.deleteMessages = () => {
      var selection = workspace.selection;
      var mbean = selection.objectName;
      if (mbean && selection) {
        var selectedItems = $scope.gridOptions.selectedItems;
        $scope.message = "Deleted " + Core.maybePlural(selectedItems.length, "message");
        var operation = "removeMessage(java.lang.String)";
        angular.forEach(selectedItems, (item, idx) => {
          var id = item.JMSMessageID;
          if (id) {
            var callback = (idx + 1 < selectedItems.length) ? intermediateResult : operationSuccess;
            jolokia.execute(mbean, operation, id, onSuccess(callback));
          }
        });
      }
    };

    $scope.retryMessages = () => {
      var selection = workspace.selection;
      var mbean = selection.objectName;
      if (mbean && selection) {
        var selectedItems = $scope.gridOptions.selectedItems;
        $scope.message = "Retry " + Core.maybePlural(selectedItems.length, "message");
        var operation = "retryMessage(java.lang.String)";
        angular.forEach(selectedItems, (item, idx) => {
          var id = item.JMSMessageID;
          if (id) {
            var callback = (idx + 1 < selectedItems.length) ? intermediateResult : operationSuccess;
            jolokia.execute(mbean, operation, id, onSuccess(callback));
          }
        });
      }
    };

    $scope.queueNames = (completionText) => {
      var queuesFolder = getSelectionQueuesFolder(workspace);
      return (queuesFolder) ? queuesFolder.children.map(n => n.title) : [];
    };

    function populateTable(response) {
      var data = response.value;
      if (!angular.isArray(data)) {
        $scope.messages = [];
        angular.forEach(data, (value, idx) => {
          $scope.messages.push(value);
        });
      } else {
        $scope.messages = data;
      }
      angular.forEach($scope.messages, (message) => {
        message.headerHtml = createHeaderHtml(message);
        message.bodyText = createBodyText(message);
      });
      Core.$apply($scope);
    }

    /*
     * For some reason using ng-repeat in the modal dialog doesn't work so lets
     * just create the HTML in code :)
     */
    function createBodyText(message) {
      if (message.Text) {
        var body = message.Text;
        var lenTxt = "" + body.length;
        message.textMode = "text (" + lenTxt + " chars)";
        return body;
      } else if (message.BodyPreview) {
        var code = Core.parseIntValue(localStorage["activemqBrowseBytesMessages"] || "1", "browse bytes messages");
        var body;

        message.textMode = "bytes (turned off)";
        if (code != 99) {
          var bytesArr = [];
          var textArr = [];
          message.BodyPreview.forEach(b => {
            if (code === 1 || code === 2) {
              // text
              textArr.push(String.fromCharCode(b));
            }
            if (code === 1 || code === 4) {
              // hex and must be 2 digit so they space out evenly
              var s = b.toString(16);
              if (s.length === 1) {
                s = "0" + s;
              }
              bytesArr.push(s);
            } else {
              // just show as is without spacing out, as that is usually more used for hex than decimal
              var s = b.toString(10);
              bytesArr.push(s);
            }
          });

          var bytesData = bytesArr.join(" ");
          var textData = textArr.join("");

          if (code === 1 || code === 2) {
            // bytes and text
            var len = message.BodyPreview.length;
            var lenTxt = "" + textArr.length;
            body = "bytes:\n" + bytesData + "\n\ntext:\n" + textData;
            message.textMode = "bytes (" + len + " bytes) and text (" + lenTxt + " chars)";
          } else {
            // bytes only
            var len = message.BodyPreview.length;
            body = bytesData;
            message.textMode = "bytes (" + len + " bytes)";
          }
        }
        return body;
      } else {
        message.textMode = "unsupported";
        return "Unsupported message body type which cannot be displayed by hawtio";
      }
    }

    /*
     * For some reason using ng-repeat in the modal dialog doesn't work so lets
     * just create the HTML in code :)
     */
    function createHeaderHtml(message) {
      var headers = createHeaders(message);
      var properties = createProperties(message);
      var headerKeys = Object.extended(headers).keys();

      function sort(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      }

      var propertiesKeys = Object.extended(properties).keys().sort(sort);

      var jmsHeaders = headerKeys.filter((key) => {
        return key.startsWith("JMS");
      }).sort(sort);

      var remaining = headerKeys.subtract(jmsHeaders, propertiesKeys).sort(sort);

      var buffer = [];

      function appendHeader(key) {

        var value = headers[key];
        if (value === null) {
          value = '';
        }

        buffer.push('<tr><td class="propertyName"><span class="green">Header</span> - ' +
            key +
            '</td><td class="property-value">' +
            value +
            '</td></tr>');
      }

      function appendProperty(key) {
        var value = properties[key];
        if (value === null) {
          value = '';
        }

        buffer.push('<tr><td class="propertyName">' +
            key +
            '</td><td class="property-value">' +
            value +
            '</td></tr>');
      }

      jmsHeaders.forEach(appendHeader);
      remaining.forEach(appendHeader);
      propertiesKeys.forEach(appendProperty);
      return buffer.join("\n");
    }

    function createHeaders(row) {
      log.debug("headers: ", row);
      var answer = {};
      angular.forEach(row, (value, key) => {
        if (!ignoreColumns.any(key) && !flattenColumns.any(key)) {
            answer[Core.escapeHtml(key)] = Core.escapeHtml(value);
        }
      });
      return answer;
    }
    
    function createProperties(row) {
      log.debug("properties: ", row);
      var answer = {};
      angular.forEach(row, (value, key) => {
        if (!ignoreColumns.any(key) && flattenColumns.any(key)) {
          angular.forEach(value, (v2, k2) => {
            answer['<span class="green">' + key.replace('Properties', ' Property') + '</span> - ' + Core.escapeHtml(k2)] = Core.escapeHtml(v2)
          });
        }
      });
      return answer;
    }

    function loadTable() {
      var selection = workspace.selection;
      if (selection) {
        var mbean = selection.objectName;
        if (mbean) {
          $scope.dlq = false;
          jolokia.getAttribute(mbean, "DLQ", onSuccess(onDlq, {silent: true}));
          jolokia.request(
                  {type: 'exec', mbean: mbean, operation: 'browse()'},
                  onSuccess(populateTable));
        }
      }
    }

    function onDlq(response) {
      $scope.dlq = response;
      Core.$apply($scope);
    }

    function intermediateResult() {
    }

    function operationSuccess() {
      $scope.messageDialog = false;
      $scope.gridOptions.selectedItems.splice(0);
      Core.notification("success", $scope.message);
      setTimeout(loadTable, 50);
    }

    function moveSuccess() {
        operationSuccess();
        workspace.loadTree();
    }
  }]);
}
