/// <reference path="activemqPlugin.ts"/>
/// <reference path="../../ui/js/CodeEditor.ts"/>
module ActiveMQ {
  export var BrowseQueueController = _module.controller("ActiveMQ.BrowseQueueController", ["$scope", "workspace", "jolokia", "localStorage", '$location', "activeMQMessage", "$timeout", "$routeParams", (
      $scope,
      workspace: Workspace,
      jolokia: Jolokia.IJolokia,
      localStorage: WindowLocalStorage,
      location: ng.ILocationService,
      activeMQMessage,
      $timeout: ng.ITimeoutService,
      $routeParams: ng.IRootScopeService) => {

    var log:Logging.Logger = Logger.get("ActiveMQ");
    var amqJmxDomain = localStorage['activemqJmxDomain'] || "org.apache.activemq";

    // all the queue names from the tree
    $scope.queueNames = [];
    // selected queue name in move dialog
    $scope.queueName = $routeParams["queueName"];

    $scope.searchText = '';
    $scope.workspace = workspace;

    $scope.allMessages = [];
    $scope.messages = [];
    $scope.headers = {};
    $scope.mode = 'text';
    $scope.showButtons = true;

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
      enableHighlighting: true,
      filterOptions: {
        filterText: '',
        useExternalFilter: true
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
      ],
      afterSelectionChange: afterSelectionChange
    };

    $scope.showMessageDetails = false;

    var ignoreColumns = ["PropertiesText", "BodyPreview", "Text"];
    var flattenColumns = ["BooleanProperties", "ByteProperties", "ShortProperties", "IntProperties", "LongProperties", "FloatProperties",
      "DoubleProperties", "StringProperties"];

    $scope.$watch('workspace.selection', function () {
      // lets defer execution as we may not have the selection just yet
      setTimeout(loadTable, 50);
    });

    $scope.$watch('gridOptions.filterOptions.filterText', (filterText) => {
      filterMessages(filterText);
    });

    $scope.openMessageDialog = (message) => {
      ActiveMQ.selectCurrentMessage(message, "JMSMessageID", $scope);
      if ($scope.row) {
        $scope.mode = CodeEditor.detectTextFormat($scope.row.Text);
        $scope.showMessageDetails = true;
      }
    };

    $scope.refresh = () => {
      $scope.gridOptions.selectedItems.length = 0;
      setTimeout(loadTable, 50);
    }

    ActiveMQ.decorate($scope);

    $scope.moveMessages = () => {
        var selection = workspace.selection;
        var mbean = selection.objectName;
        if (mbean && selection && $scope.queueName) {
            var selectedItems = $scope.gridOptions.selectedItems;
            $scope.message = "Moved " + Core.maybePlural(selectedItems.length, "message") + " to " + $scope.queueName;
            var operation = "moveMessageTo(java.lang.String, java.lang.String)";
            angular.forEach(selectedItems, (item, idx) => {
                var id = item.JMSMessageID;
                if (id) {
                    var callback = (idx + 1 < selectedItems.length) ? intermediateResult : operationSuccess;
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

    function populateTable(response) {
      log.debug("populateTable");

      // setup queue names
      if ($scope.queueNames.length === 0) {
        var queueNames = retrieveQueueNames(workspace, true);
        var selectedQueue = workspace.selection.title;
        $scope.queueNames = queueNames.filter((name) => { return name !== selectedQueue });
      }

      var data = response.value;
      if (!angular.isArray(data)) {
        $scope.allMessages = [];
        angular.forEach(data, (value, idx) => {
          $scope.allMessages.push(value);
        });
      } else {
        $scope.allMessages = data;
      }
      angular.forEach($scope.allMessages, (message) => {
        message.headerHtml = createHeaderHtml(message);
        message.bodyText = createBodyText(message);
      });
      filterMessages($scope.gridOptions.filterOptions.filterText);
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
      // log.debug("headers: ", row);
      var answer = {};
      angular.forEach(row, (value, key) => {
        if (!ignoreColumns.any(key) && !flattenColumns.any(key)) {
            answer[Core.escapeHtml(key)] = Core.escapeHtml(value);
        }
      });
      return answer;
    }
    
    function createProperties(row) {
      // log.debug("properties: ", row);
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
      var objName;

      if ($scope.queueName) {
        $scope.showButtons = false;
        $scope.dlq = false;
        var mbean = getBrokerMBean(workspace, jolokia, amqJmxDomain);
        // browseQueue(java.lang.String) is not available until ActiveMQ 5.15.0
        // https://issues.apache.org/jira/browse/AMQ-6435
        jolokia.request(
            {type: 'exec', mbean: mbean, operation: 'browseQueue(java.lang.String)', arguments: [$scope.queueName]},
            onSuccess(populateTable, {
              error: (response) => {
                // try again with the old ActiveMQ API
                $scope.queueName = null;
                $scope.showButtons = true;
                Core.$apply($scope);
                loadTable();
              }
            }));
        $scope.queueName = null;
      } else {
        if (workspace.selection) {
          objName = workspace.selection.objectName;
        } else {
          // in case of refresh
          var key = location.search()['nid'];
          var node = workspace.keyToNodeMap[key];
          objName = node.objectName;
        }

        if (objName) {
          $scope.dlq = false;
          jolokia.getAttribute(objName, "DLQ", onSuccess(onDlq, {silent: true}));
          jolokia.request(
              {type: 'exec', mbean: objName, operation: 'browse()'},
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
      deselectAll();
      Core.notification("success", $scope.message);
      setTimeout(loadTable, 50);
      Core.$apply($scope);
    }

    function filterMessages(filter) {
      var searchConditions = buildSearchConditions(filter);
      evalFilter(searchConditions);
    }

    function evalFilter(searchConditions) {
      if (!searchConditions || searchConditions.length === 0) {
        $scope.messages = $scope.allMessages;
      } else {
        log.debug("Filtering conditions:", searchConditions);
        $scope.messages = $scope.allMessages.filter((message) => {
          log.debug("Message:", message);

          var matched = true;

          $.each(searchConditions, (index, condition) => {
            if (!condition.column) {
              matched = matched && evalMessage(message, condition.regex);
            } else {
              matched = matched &&
                        (message[condition.column] && condition.regex.test(message[condition.column])) ||
                        (message.StringProperties && message.StringProperties[condition.column] && condition.regex.test(message.StringProperties[condition.column]));
            }
          });

          return matched;
        });
      }
    }

    function evalMessage(message, regex) {
      var jmsHeaders = ['JMSDestination', 'JMSDeliveryMode', 'JMSExpiration', 'JMSPriority', 'JMSMessageID', 'JMSTimestamp', 'JMSCorrelationID', 'JMSReplyTo', 'JMSType', 'JMSRedelivered'];
      for(var i = 0; i < jmsHeaders.length; i++) {
        var header = jmsHeaders[i];
        if (message[header] && regex.test(message[header])) {
          return true;
        }
      }

      if (message.StringProperties) {
        for (var property in message.StringProperties) {
          if (regex.test(message.StringProperties[property])) {
            return true;
          }
        }
      }

      if (message.bodyText && regex.test(message.bodyText)) {
        return true;
      }

      return false;
    }

    function getRegExp(str, modifiers) {
      try {
        return new RegExp(str, modifiers);
      } catch (err) {
        return new RegExp(str.replace(/(\^|\$|\(|\)|<|>|\[|\]|\{|\}|\\|\||\.|\*|\+|\?)/g, '\\$1'));
      }
    }

    function buildSearchConditions(filterText) {
      var searchConditions = [];
      var qStr;
      if (!(qStr = $.trim(filterText))) {
        return;
      }
      var columnFilters = qStr.split(";");
      for (var i = 0; i < columnFilters.length; i++) {
        var args = columnFilters[i].split(':');
        if (args.length > 1) {
          var columnName = $.trim(args[0]);
          var columnValue = $.trim(args[1]);
          if (columnName && columnValue) {
            searchConditions.push({
              column: columnName,
              columnDisplay: columnName.replace(/\s+/g, '').toLowerCase(),
              regex: getRegExp(columnValue, 'i')
            });
          }
        } else {
          var val = $.trim(args[0]);
          if (val) {
            searchConditions.push({
              column: '',
              regex: getRegExp(val, 'i')
            });
          }
        }
      }
      return searchConditions;
    }

    function afterSelectionChange(rowItem, checkAll) {
      if (checkAll === void 0) {
        // then row was clicked, not select-all checkbox
        $scope.gridOptions['$gridScope'].allSelected = rowItem.config.selectedItems.length == $scope.messages.length;
      } else {
        $scope.gridOptions['$gridScope'].allSelected = checkAll;
      }
    }

    function deselectAll() {
      $scope.gridOptions.selectedItems.length = 0;
      $scope.gridOptions['$gridScope'].allSelected = false;
    }

  }]);
}
