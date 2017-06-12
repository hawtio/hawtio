/// <reference path="../../core/js/graphs.ts"/>
/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.RouteController", ["$scope", "$rootScope", "$routeParams", "$element", "$timeout", "workspace", "$location", "jolokia", "localStorage", ($scope, $rootScope, $routeParams, $element, $timeout, workspace:Workspace, $location, jolokia, localStorage) => {
   var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";
    var log:Logging.Logger = Logger.get("Camel");

    $scope.workspace = workspace;

    $scope.viewSettings = {
      routes: []
    };

    $scope.routes = [];
    $scope.routeNodes = {};

    // if we are in dashboard then $routeParams may be null
    if ($routeParams != null) {
      $scope.contextId = $routeParams["contextId"];
      $scope.routeId = Core.trimQuotes($routeParams["routeId"]);
      $scope.isJmxTab = !$routeParams["contextId"] || !$routeParams["routeId"];
    }

    $scope.camelIgnoreIdForLabel = Camel.ignoreIdForLabel(localStorage);
    $scope.camelMaximumLabelWidth = Camel.maximumLabelWidth(localStorage);
    $scope.camelShowInflightCounter = Camel.showInflightCounter(localStorage);

    var updateRoutes = Core.throttled(doUpdateRoutes, 1000);

    // lets delay a little updating the routes to avoid timing issues where we've not yet
    // fully loaded the workspace and/or the XML model
    var delayUpdatingRoutes = 300;

    $rootScope.$on('ignoreIdForLabel', (event, value) => {
      $scope.camelIgnoreIdForLabel = value;
      $timeout(updateRoutes, delayUpdatingRoutes);
    });

    $scope.updateSelectedRoute = function() {
      $timeout(updateRoutes, delayUpdatingRoutes);
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      $timeout(updateRoutes, delayUpdatingRoutes);
    });

    $scope.$watch('workspace.selection', function () {
      if ($scope.isJmxTab && workspace.moveIfViewInvalid()) return;
      $timeout(updateRoutes, delayUpdatingRoutes);
    });

    $scope.$on('jmxTreeUpdated', function () {
      $timeout(updateRoutes, delayUpdatingRoutes);
    });

    $scope.$watch('nodeXmlNode', function () {
      if ($scope.isJmxTab && workspace.moveIfViewInvalid()) return;
      $timeout(updateRoutes, delayUpdatingRoutes);
    });

    function doUpdateRoutes() {
      var routeXmlNode = null;
      if (!$scope.ignoreRouteXmlNode) {
        routeXmlNode = getSelectedRouteNode(workspace, camelJmxDomain);
        if (!routeXmlNode) {
          routeXmlNode = $scope.nodeXmlNode;
        }
        if (routeXmlNode && routeXmlNode.localName !== "route") {
          var wrapper = document.createElement("route");
          wrapper.appendChild(routeXmlNode.cloneNode(true));
          routeXmlNode = wrapper;
        }
      }
      $scope.mbean = getSelectionCamelContextMBean(workspace, camelJmxDomain);
      if (!$scope.mbean && $scope.contextId) {
        $scope.mbean = getCamelContextMBean(workspace, $scope.contextId, camelJmxDomain)
      }
      if (routeXmlNode) {
        // lets show the remaining parts of the diagram of this route node
        $scope.nodes = {};
        var nodes = [];
        var links = [];
        $scope.processorTree = camelProcessorMBeansById(workspace, camelJmxDomain);
        var routeId = routeXmlNode.getAttribute("id");
        // init the view settings the first time
        if ($scope.viewSettings.routes.length === 0) {
          var entry = {
            name: routeId,
            selected: true
          };
          $scope.viewSettings.routes.push(entry);
        }
        Camel.addRouteXmlChildren($scope, routeXmlNode, nodes, links, null, 0, 0);
        showGraph(nodes, links);
      } else if ($scope.mbean) {
        jolokia.request(
                {type: 'exec', mbean: $scope.mbean, operation: 'dumpRoutesAsXml()'},
                onSuccess(populateTable));
      } else {
        log.info("No camel context bean! Selection: " + workspace.selection);
      }
    }

    var populateTable = function (response) {
      var data = response.value;
      // routes is the xml data of the routes
      $scope.routes = data;
      // nodes and routeNodes is the GUI nodes for the processors and routes shown in the diagram
      $scope.nodes = {};
      $scope.routeNodes = {};
      var nodes = [];
      var links = [];
      var selectedRouteId = $scope.routeId;
      if (!selectedRouteId) {
        selectedRouteId = getSelectedRouteId(workspace);
      }
      if (data) {
        var doc = $.parseXML(data);

        // init the view settings the first time
        if ($scope.viewSettings.routes.length === 0) {
          var allRoutes = $(doc).find("route");
          allRoutes.each((idx, route) => {
            var routeId = route.getAttribute("id");
            var entry = {
              name: routeId,
              selected: true
            };
            $scope.viewSettings.routes.push(entry);
          });
        }

        $scope.processorTree = camelProcessorMBeansById(workspace, camelJmxDomain);
        Camel.loadSelectedRouteXmlNodes($scope, doc, nodes, links, getWidth(), (routeId) => {
          if ($scope.viewSettings.routes.length > 0) {
            for (var idx in $scope.viewSettings.routes) {
              var route = $scope.viewSettings.routes[idx];
              if (route.name === routeId) {
                return route.selected;
              }
            }
          }
          // default to true for all routes
          return selectedRouteId == null || selectedRouteId === routeId;
        });

        showGraph(nodes, links);
      } else {
        console.log("No data from route XML!")
      }
      Core.$apply($scope);
    };


    var postfix = " selected";

    function isSelected(node) {
      if (node) {
        var className = node.getAttribute("class");
        return className && className.endsWith(postfix);
      }
      return false;
    }

    function setSelected(node, flag) {
      var answer = false;
      if (node) {
        var className = node.getAttribute("class");
        var selected = className && className.endsWith(postfix);
        if (selected) {
          className = className.substring(0, className.length - postfix.length);
        } else {
          if (!flag) {
            // no need to change!
            return answer;
          }
          className = className + postfix;
          answer = true;
        }
        node.setAttribute("class", className);
      }
      return answer;
    }

    var onClickGraphNode = function (node) {
      log.debug("Clicked on Camel Route Diagram node: " + node.cid);

      if (workspace.isRoutesFolder(camelJmxDomain)) {
        // Handle nodes selection from a diagram displaying multiple routes
        handleGraphNode(node);
      } else {
        navigateToNodeProperties(node.cid);
      }
    };

    function navigateToNodeProperties(cid) {
      $location.path('/camel/properties').search({"tab": "camel", "nid": cid});
      Core.$apply($scope);
    }

    function handleGraphNode(node) {
      var cid = node.cid;
      var routes = $scope.routes;
      if (routes) {
        var route = null;

        // Find the route associated with the node that was clicked on the diagram
        var doc = $.parseXML(routes);
        route = $(doc).find("#" + cid).parents("route") || $(doc).find("[uri='" + cid + "']").parents("route");

        // Fallback on using rid if no matching route was found
        if ((!route || !route.length) && node.rid) {
          route = $(doc).find("[id='" + node.rid + "']");
        }

        if (route && route.length) {
          var routeFolder = null;
          angular.forEach(workspace.selection.children, (c) => {
            if (c.title === route[0].id) {
              routeFolder = c;
            }
          });

          if (routeFolder) {
            // Populate route folder child nodes for the context tree
            if (!routeFolder.children.length) {
              processRouteXml(workspace, workspace.jolokia, routeFolder, (route) => {
                addRouteChildren(routeFolder, route, camelJmxDomain);
                updateRouteProperties(node, route, routeFolder)
              }, camelJmxDomain);
            } else {
              updateRouteProperties(node, route, routeFolder);
            }
          }
        } else {
          log.debug("No route found for " + cid);
        }
      }
    }

    function updateRouteProperties(node, route, routeFolder) {
      var cid = node.cid;

      $("#cameltree").dynatree("getTree").getNodeByKey(routeFolder.key).expand("true");

      // Get the 'real' cid of the selected diagram node
      var routeChild = routeFolder.findDescendant((d) => {
        var uri = node.uri;
        if (uri && uri.indexOf('?') > 0) {
          uri = uri.substring(0, uri.indexOf('?'))
        }
        return d.title === node.cid || (d.routeXmlNode.nodeName === node.type && d.title === uri);
      });
      if (routeChild) {
        cid = routeChild.key;
      }

      // Setup the properties tab view for the selected diagram node
      $scope.model = getCamelSchema("route");
      if ($scope.model) {
        var labels = [];
        if ($scope.model.group) {
          labels = $scope.model.group.split(",");
        }

        $scope.labels = labels;
        $scope.nodeData = getRouteNodeJSON(route[0]);
        $scope.icon = getRouteNodeIcon(routeFolder);
        $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";
      }

      navigateToNodeProperties(cid);
    }

    function showGraph(nodes, links) {
      var canvasDiv = $($element);
      var width = getWidth();
      var height = getHeight();
      var svg = canvasDiv.children("svg")[0];

      // do not allow clicking on node to show properties if debugging or tracing as that is for selecting the node instead
      var onClick;
      var path = $location.path();
      if (path.startsWith("/camel/debugRoute") || path.startsWith("/camel/traceRoute")) {
        onClick = null;
      } else {
        onClick = onClickGraphNode;
      }

      // re-layout the graph
      $scope.graphData = Core.dagreLayoutGraph(nodes, links, width, height, svg, false, onClick);

      // Only apply node selection behavior if debugging or tracing
      if (path.startsWith("/camel/debugRoute") || path.startsWith("/camel/traceRoute")) {
        var gNodes = canvasDiv.find("g.node");
        gNodes.click(function () {
          var selected = isSelected(this);

          // lets clear all selected flags
          gNodes.each((idx, element) => {
            setSelected(element, false);
          });

          var cid = null;
          if (!selected) {
            cid = this.getAttribute("data-cid");
            setSelected(this, true);
          }
          $scope.$emit("camel.diagram.selectedNodeId", cid);
          Core.$apply($scope);
        });
      }

      if ($scope.mbean) {
        Core.register(jolokia, $scope, {
          type: 'exec', mbean: $scope.mbean,
          operation: 'dumpRoutesStatsAsXml',
          arguments: [true, true]
          // the dumpRoutesStatsAsXml is not available in all Camel versions so do not barf on errors
        }, onSuccess(statsCallback, {silent: true, error: false}));
      }
      $scope.$emit("camel.diagram.layoutComplete");
      return width;
    }

    function getWidth() {
      var canvasDiv = $($element);
      return canvasDiv.width();
    }

    function getHeight() {
      var canvasDiv = $($element);
      return getCanvasHeight(canvasDiv);
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
        var inflight = stat.hasAttribute("exchangesInflight") ? stat.getAttribute("exchangesInflight") : 0;
        var tooltip = "";
        if (id && completed) {
          var container = isRoute ? $scope.routeNodes: $scope.nodes;
          var node = container[id];
          if (!node) {
            angular.forEach(container, (value, key) => {
              if (!node && id === value.elementId) {
                node = value;
              }
            });
          }
          if (node) {
            var total = parseInt(completed);
            var failed = stat.getAttribute("exchangesFailed");
            if (failed) {
              total += parseInt(failed);
            }
            var last = stat.getAttribute("lastProcessingTime");
            var mean = stat.getAttribute("meanProcessingTime");
            var min = stat.getAttribute("minProcessingTime");
            var max = stat.getAttribute("maxProcessingTime");
            tooltip = "total: " + total + "\ninflight:" + inflight + "\nlast: " + last + " (ms)\nmean: " + mean + " (ms)\nmin: " + min + " (ms)\nmax: " + max + " (ms)";

            node["counter"] = total;
            if ($scope.camelShowInflightCounter) {
              node["inflight"] = inflight;
            }
            var labelSummary = node["labelSummary"];
            if (labelSummary) {
              tooltip = labelSummary + "\n\n" + tooltip;
            }
            node["tooltip"] = tooltip;
          } else {
            // we are probably not showing the route for these stats
          }
        }
      }
    }
  }]);
}



