module Camel {

  export function BrowseEndpointController($scope, workspace:Workspace, jolokia) {
    $scope.workspace = workspace;

    $scope.messageDialog = new Core.Dialog();

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
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
      maintainColumnRatios: false,
      columnDefs: [
        {
          field: 'id',
          displayName: 'ID',
          // for ng-grid
          //width: '50%',
          // for hawtio-datatable
          // width: "22em",
          cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.id}}</a></div>'
        }
      ]
    };

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      loadData();
    });

    $scope.openMessageDialog = (message) => {
      $scope.row = Core.pathGet(message, ["entity"]);
      if ($scope.row) {
        $scope.messageDialog.open();
      }
    };


    function loadData() {
      var mbean = workspace.getSelectedMBeanName();
      if (mbean) {
        var options = onSuccess(populateTable);
        jolokia.execute(mbean, 'browseAllMessagesAsXml(java.lang.Boolean)', true, options);
      }
    }

    function populateTable(response) {
      var data = [];
      if (angular.isString(response)) {
        // lets parse the XML DOM here...
        var doc = $.parseXML(response);
        var allMessages = $(doc).find("message");

        allMessages.each((idx, message) => {
          var messageData = {
            headers: {},
            headerTypes: {},
            id: null,
            headerHtml: ""
          };
          var headers = $(message).find("header");
          var headerHtml = "";
          headers.each((idx, header) => {
            var key = header.getAttribute("key");
            var typeName = header.getAttribute("type");
            var value = header.textContent;
            if (key) {
              if (value) messageData.headers[key] = value;
              if (typeName) messageData.headerTypes[key] = typeName;

              headerHtml += "<tr><td class='property-name'>" + key + "</td>" +
                      "<td class='property-value'>" + (value || "") + "</td></tr>";
            }
          });
          messageData.headerHtml = headerHtml;
          var id = messageData.headers["breadcrumbId"];
          if (!id) {
            // lets find the first header with a name or Path in it
            angular.forEach(messageData.headers, (value, key) => {
              if (!id && (key.endsWith("Name") || key.endsWith("Path"))) {
                id = value;
              }
            });
            // if still no value, lets use the first :)
            angular.forEach(messageData.headers, (value, key) => {
              if (!id) id = value;
            });
          }
          messageData.id = id;
          var body = $(message).children("body")[0];
          if (body) {
            var bodyText = body.textContent;
            var bodyType = body.getAttribute("type");
            messageData["body"] = bodyText;
            messageData["bodyType"] = bodyType;
          }
          data.push(messageData);
        });
      }
      $scope.messages = data;
      Core.$apply($scope);
    }
  }
}