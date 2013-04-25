module Camel {
    export function TraceRouteController($scope, workspace:Workspace) {
      $scope.tracing = false;
      $scope.tracingBodyLength = 1000;
      $scope.data = [];
      $scope.graphView = null;
      $scope.tableView = null;

      $scope.selectHandler = (selected) => {
        if (selected) {
          var toNode = selected["toNode"];
          if (toNode) {
            // lets highlight the node in the diagram
            var nodes = d3.select("svg").selectAll("g .node");

            // lets clear the selected node first
            nodes.attr("class", "node");

            nodes.filter(function (item) {
              if (item) {
                var cid = item["cid"];
                var rid = item["rid"];
                if (cid) {
                  // we should match cid if defined
                  return toNode === cid;
                } else {
                  return toNode === rid;
                }
              }
              return null;
            }).attr("class", "node selected");
          }
        }
      };

      $scope.widget = new TableWidget($scope, workspace, [
        {
          "mDataProp": null,
          "sClass": "control center",
          "sDefaultContent": '<i class="icon-plus"></i>'
        }
      ], {
        rowDetailTemplateId: 'camelMessageTemplate',
        ignoreColumns: ["headerTypes", "body"],
        flattenColumns: ["headers"],
        selectHandler: $scope.selectHandler
      });

      var jolokia = workspace.jolokia;

      function tracingChanged(response) {
        reloadTracingFlag();
        $scope.$apply();
      }

      function setTracing(flag:Boolean) {
        var mbean = getSelectionCamelTraceMBean(workspace);
        if (mbean) {
          jolokia.setAttribute(mbean, "Enabled", flag, onSuccess(tracingChanged));
        }
      }


      $scope.startTracing = () => {
        setTracing(true);
      };

      $scope.stopTracing = () => {
        setTracing(false);
      };

      function reloadTracingFlag() {
        $scope.tracing = false;
        // clear any previous polls
        closeHandle($scope, jolokia);

        var mbean = getSelectionCamelTraceMBean(workspace);
        if (mbean) {
          $scope.tracing = jolokia.getAttribute(mbean, "Enabled", onSuccess(null));

          if ($scope.tracing) {
            var traceMBean = mbean;
            if (traceMBean) {
              // set the body length
              // the body max chars attribute is not available on all Camel versions, so do not barf on error
              console.log("Setting body max chars to " + $scope.tracingBodyLength);
              jolokia.setAttribute(mbean, "BodyMaxChars", $scope.tracingBodyLength, onSuccess(null, {silent: true, error: false}));

              var query = {type: 'exec', mbean: traceMBean, operation: 'dumpAllTracedMessagesAsXml'};
              scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(populateRouteMessages, query));
            }
            $scope.graphView = "app/camel/html/routes.html";
            $scope.tableView = "app/camel/html/browseRoute.html";
          } else {
            $scope.data = [];
            $scope.graphView = null;
            $scope.tableView = null;
          }
          console.log("Tracing is now " + $scope.tracing);
        }
      }

      $scope.$watch('workspace.selection', function () {
        if (workspace.moveIfViewInvalid()) return;
        $scope.data = [];
        reloadTracingFlag();
      });


      var populateRouteMessages = function (response) {
        var first = $scope.data.length === 0;
        var xml = response.value;
        if (angular.isString(xml)) {
          // lets parse the XML DOM here...
          var doc = $.parseXML(xml);
          var allMessages = $(doc).find("fabricTracerEventMessage");
          if (!allMessages || !allMessages.length) {
            // lets try find another element name
            allMessages = $(doc).find("backlogTracerEventMessage");
          }

          allMessages.each((idx, message) => {
            var messageData = {
              headers: {},
              headerTypes: {}
            };
            var headers = $(message).find("header");
            headers.each((idx, header) => {
              var key = header.getAttribute("key");
              var typeName = header.getAttribute("type");
              var value = header.textContent;
              if (key) {
                if (value) messageData.headers[key] = value;
                if (typeName) messageData.headerTypes[key] = typeName;
              }
            });
            var body = $(message).find("body")[0];
            if (body) {
              var bodyText = body.textContent;
              var bodyType = body.getAttribute("type");
              messageData["body"] = bodyText;
              messageData["bodyType"] = bodyType;
            }
            var toNode = $(message).find("toNode").text();
            if (toNode) {
              messageData["toNode"] = toNode;
            }
            $scope.data.push(messageData);
            if (first) {
              console.log("Loading first item");
              $scope.widget.populateTable($scope.data);
              first = false;
            } else {
              console.log("Loading another row!");
              $scope.widget.addData(messageData);
            }
          });
        }
      };
    }
}