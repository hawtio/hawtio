module Jmx {
  export function ChartController($scope, $location, workspace:Workspace, jolokia, localStorage) {

    $scope.metrics = [];

    $scope.$on('$destroy', function () {
      $scope.dereg();
      if ($scope.context) {
        $scope.context.stop();
        $scope.context = null;
      }
      $("#charts").children().remove();
    });

    $scope.dereg = $scope.$watch('workspace.selection', render);

    function render(node, oldValue) {
      if (!angular.isDefined(node)) {
        return;
      }
      var width = 594;
      var charts = $("#charts");

      if (charts) {
        width = charts.width();
      } else {
        return;
      }

      var mbean = node.objectName;
      $scope.metrics = [];

      var updateRate = localStorage['updateRate'];
      if (!angular.isDefined(updateRate)) {
        updateRate = 0
      }
      var context = cubism.context()
              .serverDelay(updateRate)
              .clientDelay(updateRate)
              .step(updateRate)
              .size(width);

      $scope.context = context;
      $scope.jolokiaContext = context.jolokia(jolokia);
      var search = $location.search();
      var attributeNames = toSearchArgumentArray(search["att"]);

      if (mbean) {
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
                if (isNumberTypeName(typeName) && (!attributeNames.length || attributeNames.indexOf(key) >= 0)) {
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
      } else {
        // lets try pull out the attributes and elements from the URI and use those to chart
        var elementNames = toSearchArgumentArray(search["el"]);
        if (attributeNames && attributeNames.length && elementNames && elementNames.length) {

          // first lets map the element names to mbean names to keep the URI small
          var mbeans = {};
          elementNames.forEach((elementName) => {
            var child = node.get(elementName);
            if (child) {
              var mbean = child.objectName;
              if (mbean) {
                mbeans[elementName] = mbean;
              }
            }
          });

          // lets create the metrics
          attributeNames.forEach((key) => {
            angular.forEach(mbeans, (mbean, name) => {
              var attributeTitle = humanizeValue(key);
              // for now lets always be verbose
              var title = name + ": " + attributeTitle;

              var metric = $scope.jolokiaContext.metric({
                type: 'read',
                mbean: mbean,
                attribute: key
              }, title);
              if (metric) {
                $scope.metrics.push(metric);
              }
            });
          });
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
          });
        });

      }
    };

  }
}
