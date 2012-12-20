function CamelController($scope, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.routes = [];

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    $scope.mbean = getSelectionCamelContextMBean(workspace);
    if ($scope.mbean) {
      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesAsXml()'},
              onSuccess(populateTable));
    }
  });

  var populateTable = function (response) {
    var data = response.value;
    $scope.routes = data;
    $scope.nodes = {};
    var nodes = [];
    var links = [];
    var selectedRouteId = null;
    var selection = workspace.selection;
    if (selection) {
      if (selection && selection.entries) {
        var typeName = selection.entries["type"];
        var name = selection.entries["name"];
        if ("routes" === typeName && name) {
          selectedRouteId = trimQuotes(name);
        }
      }
    }
    if (data) {
      var doc = $.parseXML(data);
      var allRoutes = $(doc).find("route");

      var canvasDiv = $('#canvas');
      var width = canvasDiv.width();
      var height = canvasDiv.height();
      if (height < 300) {
        console.log("browse thinks the height is only " + height + " so calculating offset from doc height");
        height = $(document).height() - canvasDiv.offset()['top'] - 5;
      }
      //console.log("Using width " + width + " and height " + height);

      var delta = 150;

      function addChildren(parent, parentId, parentX, parentY) {
        var x = parentX;
        var y = parentY + delta;
        var rid = parent.getAttribute("id");
        $(parent).children().each((idx, route) => {
          var id = nodes.length;
          // from acts as a parent even though its a previous sibling :)
          if (route.nodeName === "from" && !parentId) {
            parentId = id;
          }
          var name = route.nodeName;
          var uri = route.getAttribute("uri");
          if (uri) {
            name += " " + uri;
          }
          var imageName = route.nodeName;

          var endpointNames = ["from", "to", "route"];
          var genericNames = ["xpath", "when", "otherwise"];

          //if (imageName === "from" || imageName === "to" || imageName === "route") {
          if (endpointNames.indexOf(imageName) >= 0) {
            imageName = "endpoint";
          } else if (genericNames.indexOf(imageName) >= 0) {
            // TODO have better mapping here generated from existing image names!
            imageName = "generic";
          }
          var imageUrl = url("/app/camel/img/" + imageName + "24.png");
          //console.log("Image URL is " + imageUrl);
          var cid = route.getAttribute("id");
          var node = { "name": name, "label": name, "group": 1, "id": id, "x": x, "y:": y, "imageUrl": imageUrl, "cid": cid};
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
            links.push({"source": parentId, "target": id, "value": 1});
          }
          addChildren(route, id, x, y);
          x += delta;
        });
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

      //d3ForceGraph(nodes, links, width, height);
      $scope.graphData = dagreLayoutGraph(nodes, links, width, height);

      var jolokia = workspace.jolokia;
      var query = {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesStatsAsXml', arguments: [true, true]};
      scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(statsCallback, query));
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
      dagreUpdateGraphData($scope.graphData);
    }
  }
}

function getContextId(workspace) {
  var selection = workspace.selection;
  var tree = workspace.tree;
  var folderNames = selection.folderNames;
  var entries = selection.entries;
  var contextId;
  if (tree && selection) {
    if (folderNames && folderNames.length > 1) {
      contextId = folderNames[1];
    } else if (entries) {
      contextId = entries["context"];
    }
  }
  return contextId;
}

/**
 * Returns the selected camel context mbean for the given selection or null if it cannot be found
 */
function getSelectionCamelContextMBean(workspace) {
  if (workspace) {
    var contextId = getContextId(workspace);
    var selection = workspace.selection;
    var tree = workspace.tree;
    if (tree && selection) {
      var domain = selection.domain;
      if (domain && contextId) {
        var result = tree.navigate(domain, contextId, "context");
        if (result && result.children) {
          var contextBean = result.children.first();
          if (contextBean.title) {
            var contextName = contextBean.title;
            return "" + domain + ":context=" + contextId + ',type=context,name="' + contextName + '"';
          }
        }
      }
    }
  }
  return null;
}

/**
 * Returns the selected camel trace mbean for the given selection or null if it cannot be found
 */
function getSelectionCamelTraceMBean(workspace) {
  if (workspace) {
    var contextId = getContextId(workspace);
    var selection = workspace.selection;
    var tree = workspace.tree;
    if (tree && selection) {
      var domain = selection.domain;
      if (domain && contextId) {
        var result = tree.navigate(domain, contextId, "fabric");
        if (result && result.children) {
          var mbean = result.children.first();
          return mbean.objectName;
        }
      }
    }
  }
  return null;
}



