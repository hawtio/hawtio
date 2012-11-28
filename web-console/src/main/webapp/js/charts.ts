function ChartController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.metrics = [];

  $scope.$watch('workspace.selection', function () {
    var width = 594;
    var charts = $("#charts");
    if (charts) {
      width = charts.width();
    }
    // lets stop any old context and remove its charts first
    if ($scope.context) {
      $scope.context.stop();
      $scope.context = null;
    }
    charts.children().remove();

    // some sample metrics
    /*  var metricMem = jolokia.metric({
     type: 'read',
     mbean: 'java.lang:type=Memory',
     attribute: 'HeapMemoryUsage',
     path: 'used'
     }, "HeapMemory Usage");

     var metricLoad = jolokia.metric({
     type: 'read',
     mbean: 'java.lang:type=OperatingSystem',
     attribute: 'ProcessCpuTime'
     }, "CPU Load");

     var memory = jolokia.metric(
     function (resp1, resp2) {
     return Number(resp1.value) / Number(resp2.value);
     },
     {type: "read", mbean: "java.lang:type=Memory", attribute: "HeapMemoryUsage", path: "used"},
     {type: "read", mbean: "java.lang:type=Memory", attribute: "HeapMemoryUsage", path: "max"}, "Heap-Memory"
     );
     var gcCount = jolokia.metric(
     {type: "read", mbean: "java.lang:name=PS MarkSweep,type=GarbageCollector", attribute: "CollectionCount"},
     {delta: 1000, name: "GC Old"}
     );
     var gcCount2 = jolokia.metric(
     {type: "read", mbean: "java.lang:name=PS Scavenge,type=GarbageCollector", attribute: "CollectionCount"},
     {delta: 1000, name: "GC Young"}
     );
     */

    var node = $scope.workspace.selection;
    var mbean = node.objectName;
    $scope.metrics = [];
    if (mbean) {
      var jolokia = $scope.workspace.jolokia;
      var context = cubism.context()
              .serverDelay(0)
              .clientDelay(0)
              .step(1000)
              .size(width);

      $scope.context = context;
      $scope.jolokiaContext = context.jolokia($scope.workspace.jolokia);

      // TODO make generic as we can cache them; they rarely ever change
      // lets get the attributes for this mbean

      // we need to escape the mbean path for list
      var listKey = encodeMBeanPath(mbean);
      //console.log("Looking up mbeankey: " + listKey);
      var meta = jolokia.list(listKey);
      if (meta) {
        var attributes = meta.attr;
        if (attributes) {
          for (var key in attributes) {
            var value = attributes[key];
            if (value) {
              var typeName = value['type'];
              if (isNumberTypeName(typeName)) {
                var metric = $scope.jolokiaContext.metric({
                  type: 'read',
                  mbean: mbean,
                  attribute: key
                }, humanizeValue(key));
                if (metric) {
                  $scope.metrics.push(metric);
                }
              }
            }
          }
        }
      }
    }

    if ($scope.metrics.length > 0) {
      d3.select("#charts").selectAll(".axis")
              .data(["top", "bottom"])
              .enter().append("div")
              .attr("class", function (d) {
                return d + " axis";
              })
              .each(function (d) {
                d3.select(this).call(context.axis().ticks(12).orient(d));
              });

      d3.select("#charts").append("div")
              .attr("class", "rule")
              .call(context.rule());

      context.on("focus", function (i) {
        d3.selectAll(".value").style("right", i === null ? null : context.size() - i + "px");
      });

      $scope.metrics.forEach((metric) => {
        d3.select("#charts").call(function (div) {
          div.append("div")
                  .data([metric])
                  .attr("class", "horizon")
                  .call(context.horizon());
          //.call(context.horizon().extent([-10, 10]));
        });
      });
    } else {
      // lets forward to the chart selection UI
      $location.path("chartSelect");
    }
  });
}

function ChartSelectController($scope, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.selectedAttributes = [];
  $scope.selectedMBeans = [];
  $scope.metrics = {};
  $scope.mbeans = {};
  $scope.metricsSize = 20;

  $scope.hasAttributeAndMBeanSelected = () => {
    return $scope.selectedAttributes.length && $scope.selectedMBeans.length;
  };

  // TODO move to $rootScope?
  $scope.size = (value) => {
    console.log("Calling size on " + value);
    if (angular.isObject(value)) {
      return Object.size(value);
    } else if (angular.isArray(value)) {
      return value.length;
    }
    return value;
  };

  $scope.$watch('workspace.selection', function () {
    $scope.selectedAttributes = [];
    $scope.selectedMBeans = [];
    $scope.metrics = {};
    $scope.mbeans = {};
    var mbeanCounter = 0;
    var resultCounter = 0;
    var jolokia = $scope.workspace.jolokia;
    var node = $scope.workspace.selection;
    if (node && jolokia) {
      // lets iterate through all the children
      var children = node.children;
      if (children) {
        children.forEach((mbeanNode) => {
          var mbean = mbeanNode.objectName;
          var name = mbeanNode.title;
          if (name && mbean) {
            mbeanCounter++;
            $scope.mbeans[name] = mbean;
            // we need to escape the mbean path for list
            var listKey = encodeMBeanPath(mbean);
            jolokia.list(listKey, onSuccess((meta) => {
              var attributes = meta.attr;
              if (attributes) {
                for (var key in attributes) {
                  var value = attributes[key];
                  if (value) {
                    var typeName = value['type'];
                    if (isNumberTypeName(typeName)) {
                      if (!$scope.metrics[key]) {
                        //console.log("Number attribute " + key + " for " + mbean);
                        $scope.metrics[key] = {
                          type: 'read',
                                mbean: mbean,
                                attribute: key
                        };
                      }
                    }
                  }
                }
                if (++resultCounter >= mbeanCounter) {
                  // TODO do we need to sort just in case?

                  // lets update the sizes using jquery as it seems AngularJS doesn't support it
                  $("#attributes").attr("size", Object.size($scope.metrics));
                  $("#mbeans").attr("size", Object.size($scope.mbeans));
                  $scope.$apply();
                }
              }
            }));
          }
        });
      }
    }
  });
}