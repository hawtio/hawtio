module Camel {
  export function CamelController($scope, $element, workspace:Workspace, jolokia) {
    $scope.routes = [];

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateRoutes, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateRoutes();
    });

    function updateRoutes() {
      $scope.mbean = getSelectionCamelContextMBean(workspace);
      if ($scope.mbean) {
        jolokia.request(
                {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesAsXml()'},
                onSuccess(populateTable));
      } else {
        console.log("No camel context bean!")
      }
    }

    var populateTable = function (response) {
      var data = response.value;
      $scope.routes = data;
      $scope.nodes = {};
      var nodes = [];
      var links = [];
      var selectedRouteId = getSelectedRouteId(workspace);
      if (data) {
        var doc = $.parseXML(data);
        var allRoutes = $(doc).find("route");
        var canvasDiv = $($element);
        var width = canvasDiv.width();
        var height = canvasDiv.height();
        if (height < 300) {
          console.log("browse thinks the height is only " + height + " so calculating offset from doc height");
          var offset = canvasDiv.offset();
          height = $(document).height() - 5;
          if (offset) {
            var top = offset['top'];
            if (top) {
              height -= top;
            }
          }
        }
        //console.log("Using width " + width + " and height " + height);

        var delta = 150;

        function addChildren(parent, parentId, parentX, parentY, parentNode = null) {
          var x = parentX;
          var y = parentY + delta;
          var rid = parent.getAttribute("id");
          var siblingNodes = [];
          $(parent).children().each((idx, route) => {
            var id = nodes.length;
            // from acts as a parent even though its a previous sibling :)
            if (route.nodeName === "from" && !parentId) {
              parentId = id;
            }
            var nodeId = route.nodeName;
            var nodeSettings = _apacheCamelModel.nodes[nodeId];
            var node = null;
            if (nodeSettings) {
              var imageName = nodeSettings["icon"];
              if (!imageName) {
                imageName = "generic24.png";
              }
              var label = nodeSettings["title"] || nodeId;
              var uri = route.getAttribute("uri");
              if (uri) {
                label += " " + uri;
              }
              var tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || name;
              var imageUrl = url("/app/camel/img/" + imageName);

              //console.log("Image URL is " + imageUrl);
              var cid = route.getAttribute("id");
              node = { "name": name, "label": label, "group": 1, "id": id, "x": x, "y:": y, "imageUrl": imageUrl, "cid": cid, "tooltip": tooltip};
              if (rid) {
                node["rid"] = rid;
              }
              if (cid) {
                $scope.nodes[cid] = node;
              }
              // only use the route id on the first from node
              rid = null;
              nodes.push(node);
              if (parentId !== null && parentId !== id) {
                if (siblingNodes.length === 0 || parent.nodeName === "choice") {
                  links.push({"source": parentId, "target": id, "value": 1});
                } else {
                  siblingNodes.forEach(function (nodeId) {
                    links.push({"source": nodeId, "target": id, "value": 1});
                  });
                  siblingNodes.length = 0;
                }
              }
            } else {
              // ignore non EIP nodes, though we should add expressions...
              var langSettings = _apacheCamelModel.languages[nodeId];
              if (langSettings && parentNode) {
                // lets add the language kind
                var name = langSettings["name"] || nodeId;
                var text = route.textContent;
                if (text) {
                  parentNode["tooltip"] = parentNode["label"] + " " + name + " " + text;
                  parentNode["label"] = text;
                } else {
                  parentNode["label"] = parentNode["label"] + " " + name;
                }
              }
            }
            var siblings = addChildren(route, id, x, y, node);
            if (parent.nodeName === "choice") {
              siblingNodes = siblingNodes.concat(siblings);
              x += delta;
            } else if (nodeId === "choice") {
              siblingNodes = siblings;
              y += delta;
            } else {
              siblingNodes = [nodes.length - 1];
              y += delta;
            }
          });
          return siblingNodes;
        }

        var routeDelta = width / allRoutes.length;
        var rowX = 0;
        allRoutes.each((idx, route) => {
          var routeId = route.getAttribute("id");
          if (!selectedRouteId || !routeId || selectedRouteId === routeId) {
            addChildren(route, null, rowX, 0);
            rowX += routeDelta;
          }
        });

        var svg = canvasDiv.children("svg")[0];
        $scope.graphData = Core.dagreLayoutGraph(nodes, links, width, height, svg);

        Core.register(jolokia, $scope, {
          type: 'exec', mbean: $scope.mbean,
          operation: 'dumpRoutesStatsAsXml',
          arguments: [true, true]
        }, onSuccess(statsCallback));
      } else {
        console.log("No data from route XML!")
      }
      $scope.$apply();
    };


    function statsCallback(response) {
      var data = response.value;
      if (data) {
        var doc = $.parseXML(data);
        var allStats = $(doc).find("processorStat");
        allStats.each((idx, stat) => {
          var id = stat.getAttribute("id");
          var completed = stat.getAttribute("exchangesCompleted");
          var tooltip = "";
          if (id && completed) {
            var node = $scope.nodes[id];
            if (node) {
              var meanProcessingTime = stat.getAttribute("meanProcessingTime");
              if (meanProcessingTime) {
                tooltip = "mean processing time " + meanProcessingTime + " (ms)";
              }
              var total = 0 + parseInt(completed);
              var failed = stat.getAttribute("exchangesFailed");
              if (failed) {
                total += parseInt(failed);
              }
              node["counter"] = total;
              node["tooltip"] = tooltip;
            } else {
              // we are probably not showing the route for these stats
              //console.log("Warning, could not find " + id);
            }
          }
        });

        // now lets try update the graph
        Core.dagreUpdateGraphData($scope.graphData);
      }
    }
  }



}



