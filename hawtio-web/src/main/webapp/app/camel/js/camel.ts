
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
      var routeXmlNode = getSelectedRouteNode(workspace);
      $scope.mbean = getSelectionCamelContextMBean(workspace);
      if (routeXmlNode) {
        // lets show the remaining parts of the diagram of this route node
        $scope.nodes = {};
        var nodes = [];
        var links = [];
        addChildren(routeXmlNode, nodes, links, null, 0, 0);
        showGraph(nodes, links);
      } else if ($scope.mbean) {
        jolokia.request(
                {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesAsXml()'},
                onSuccess(populateTable));
      } else {
        console.log("No camel context bean!")
      }
    }

    var populateTable = function (response) {
      var data = response.value;
      // routes is the xml data of the routes
      $scope.routes = data;
      // nodes and routeNodes is the GUI nodes for the processors and routes shown in the diagram
      $scope.nodes = {};
      $scope.routeNodes = {}
      var nodes = [];
      var links = [];
      var selectedRouteId = getSelectedRouteId(workspace);
      if (data) {
        var doc = $.parseXML(data);
        var allRoutes = $(doc).find("route");
        var width = getWidth();
        var routeDelta = width / allRoutes.length;
        var rowX = 0;
        allRoutes.each((idx, route) => {
          var routeId = route.getAttribute("id");
          if (!selectedRouteId || !routeId || selectedRouteId === routeId) {
            addChildren(route, nodes, links, null, rowX, 0);
            rowX += routeDelta;
          }
        });
        showGraph(nodes, links);
      } else {
        console.log("No data from route XML!")
      }
      $scope.$apply();
    };


    function showGraph(nodes, links) {
      var canvasDiv = $($element);
      var width = getWidth();
      var height = getHeight();
      var svg = canvasDiv.children("svg")[0];
      $scope.graphData = Core.dagreLayoutGraph(nodes, links, width, height, svg);

      Core.register(jolokia, $scope, {
        type: 'exec', mbean: $scope.mbean,
        operation: 'dumpRoutesStatsAsXml',
        arguments: [true, true]
      }, onSuccess(statsCallback));
      return width;
    }

    function addChildren(parent, nodes, links, parentId, parentX, parentY, parentNode = null) {
      var delta = 150;
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
        var nodeSettings = getCamelSchema(nodeId);
        var node = null;
        if (nodeSettings) {
          var label = nodeSettings["title"] || nodeId;
          var uri = getRouteNodeUri(route);
          if (uri) {
            label += " " + uri;
          }
          var tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || name;
          var imageUrl = getRouteNodeIcon(nodeSettings);

          //console.log("Image URL is " + imageUrl);
          var cid = route.getAttribute("id");
          node = { "name": name, "label": label, "group": 1, "id": id, "x": x, "y:": y, "imageUrl": imageUrl, "cid": cid, "tooltip": tooltip};
          if (rid) {
            node["rid"] = rid;
            $scope.routeNodes[rid] = node;
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
          var langSettings =  Camel.camelLanguageSettings(nodeId);
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
        var siblings = addChildren(route, nodes, links, id, x, y, node);
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

    function getWidth() {
      var canvasDiv = $($element);
      return canvasDiv.width();
    }

    function getHeight() {
      var canvasDiv = $($element);
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
      return height;
    }

    function statsCallback(response) {
      var data = response.value;
      if (data) {
        var doc = $.parseXML(data);

        var allStats = $(doc).find("routeStat");
        allStats.each((idx, stat) => {
          addTooltipToNode(true, stat);
        });

        var allStats = $(doc).find("processorStat");
        allStats.each((idx, stat) => {
          addTooltipToNode(false, stat);
        });

        // now lets try update the graph
        Core.dagreUpdateGraphData($scope.graphData);
      }

      function addTooltipToNode(isRoute, stat) {
        // we could have used a function instead of the boolean isRoute parameter (but sometimes that is easier)
        var id = stat.getAttribute("id");
        var completed = stat.getAttribute("exchangesCompleted");
        var tooltip = "";
        if (id && completed) {
          var node = isRoute ? $scope.routeNodes[id]: $scope.nodes[id];
          if (node) {
            var total = 0 + parseInt(completed);
            var failed = stat.getAttribute("exchangesFailed");
            if (failed) {
              total += parseInt(failed);
            }
            var last = stat.getAttribute("lastProcessingTime");
            var mean = stat.getAttribute("meanProcessingTime");
            var min = stat.getAttribute("minProcessingTime");
            var max = stat.getAttribute("maxProcessingTime");
            tooltip = "last: " + last + " (ms)\nmean: " + mean + " (ms)\nmin: " + min + " (ms)\nmax: " + max + " (ms)";

            node["counter"] = total;
            node["tooltip"] = tooltip;
          } else {
            // we are probably not showing the route for these stats
            //console.log("Warning, could not find " + id);
          }
        }
      }
    }

  }

}



