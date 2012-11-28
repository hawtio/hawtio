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
    }
  });
}


