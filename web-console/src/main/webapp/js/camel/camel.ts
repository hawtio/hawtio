function CamelController($scope, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.routes = [];

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    var mbean = getSelectionCamelContextMBean(workspace);
    if (mbean) {
      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: mbean, operation: 'dumpRoutesAsXml()'},
              onSuccess(populateTable));
    }
  });

  var populateTable = function (response) {
    var data = response.value;
    $scope.routes = data;
    var nodes = [];
    var links = [];
    var selectedRouteId = null;
    var selection = workspace.selection;
    if (selection) {
      if (selection && selection.entries) {
        var typeName = selection.entries["type"];
        var name = selection.entries["name"];
        if (typeName && name) {
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
      console.log("Using width " + width + " and height " + height);

      var delta = 150;

      function addChildren(parent, parentId, parentX, parentY) {
        var x = parentX;
        var y = parentY + delta;
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
          var imageUrl = "/img/camel/" + imageName + "24.png";
          //console.log("Image URL is " + imageUrl);
          nodes.push({ "name": name, "label": name, "group": 1, "id": id, "x": x, "y:": y, "imageUrl": imageUrl });
          if (parentId !== null && parentId !== id) {
            console.log(parent.nodeName + "(" + parentId + " @" + parentX + "," + parentY + ")" + " -> " + route.nodeName + "(" + id + " @" + x + "," + y + ")");
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
      dagreLayoutGraph(nodes, links, width, height);
    }
    $scope.$apply();
  };
}

/**
 * Returns the selected camel context mbean for the given selection or null if it cannot be found
 */
function getSelectionCamelContextMBean(workspace) {
  if (workspace) {
    var selection = workspace.selection;
    var tree = workspace.tree;
    var folderNames = selection.folderNames;
    var entries = selection.entries;
    var domain;
    var contextId;
    if (tree && selection) {
      if (folderNames && folderNames.length > 1) {
        domain = folderNames[0];
        contextId = folderNames[1];
      } else if (entries) {
        domain = selection.domain;
        contextId = entries["context"];
      }
    }
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
  return null;
}



