/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.RouteController", ["$scope", "$routeParams", "$element", "$timeout", "workspace", "$location", "jolokia", "localStorage", ($scope, $routeParams, $element, $timeout, workspace:Workspace, $location, jolokia, localStorage) => {
    var log:Logging.Logger = Logger.get("Camel");

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

    var updateRoutes = Core.throttled(doUpdateRoutes, 1000);

    // lets delay a little updating the routes to avoid timing issues where we've not yet
    // fully loaded the workspace and/or the XML model
    var delayUpdatingRoutes = 300;

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
        routeXmlNode = getSelectedRouteNode(workspace);
        if (!routeXmlNode) {
          routeXmlNode = $scope.nodeXmlNode;
        }
        if (routeXmlNode && routeXmlNode.localName !== "route") {
          var wrapper = document.createElement("route");
          wrapper.appendChild(routeXmlNode.cloneNode(true));
          routeXmlNode = wrapper;
        }
      }
      $scope.mbean = getSelectionCamelContextMBean(workspace);
      if (!$scope.mbean && $scope.contextId) {
        $scope.mbean = getCamelContextMBean(workspace, $scope.contextId)
      }
      if (routeXmlNode) {
        // lets show the remaining parts of the diagram of this route node
        $scope.nodes = {};
        var nodes = [];
        var links = [];
        $scope.processorTree = camelProcessorMBeansById(workspace);
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
        $scope.processorTree = camelProcessorMBeansById(workspace);
        Camel.loadRouteXmlNodes($scope, doc, selectedRouteId, nodes, links, getWidth());
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

    function showGraph(nodes, links) {
      var canvasDiv = $($element);
      var width = getWidth();
      var height = getHeight();
      var svg = canvasDiv.children("svg")[0];
      $scope.graphData = Core.dagreLayoutGraph(nodes, links, width, height, svg);

      var gNodes = canvasDiv.find("g.node");
      gNodes.click(function() {
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

      // TODO: https://github.com/hawtio/hawtio/issues/1261
      // we need some kind of right-click menu on d3
      // disabled code below as its work in progress
/*      gNodes.dblclick(function() {
        //var allStats = $(doc).find("processorStat");
        var cid = this.getAttribute("data-cid");
        log.info("You double clicked " + cid);

        // find the node of the cid we clicked, and then find the folder in the Camel tree
        // to grab the folder key, which is the nid for the location in the JMX plugin to
        // view the processor mbean
        var node = $scope.nodes[cid];
        if (node) {
          var pid = node.elementId;

          var processors = camelProcessorMBeansById(workspace);
          var processor = processors[pid];
          if (processor) {
            var key = processor.key;
            // change url to jmx attributes so we can see the jmx stats for the selected processor
            $location.search("nid", key);
            var url = "/jmx/attributes";
            var href = Core.createHref($location, url);
            // change path to the jmx attributes page so we can see the processor mbean
            log.info("Changing to path: " + href);
            $location.url(href);
            Core.$apply($scope);
          }
        }
      });*/

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
            var labelSummary = node["labelSummary"];
            if (labelSummary) {
              tooltip = labelSummary + "\n\n" + tooltip;
            }
            node["tooltip"] = tooltip;
          } else {
            // we are probably not showing the route for these stats
/*
            var keys = Object.keys(container).sort();
            log.info("Warning, could not find node for " + id + " when keys were: " + keys);
*/
          }
        }
      }
    }
  }]);
}



