module Jmx {
  export function ChartController($scope, $element, $location, workspace:Workspace, jolokia, localStorage) {

    $scope.metrics = [];
    $scope.updateRate = parseInt(localStorage['updateRate']);

    $scope.$on('$destroy', function () {
      $scope.dereg();
      if ($scope.context) {
        $scope.context.stop();
        $scope.context = null;
      }
      $($element).children().remove();
    });

    $scope.errorMessage = () => {
      if ($scope.updateRate === 0) {
        return "updateRate";
      }

      if ($scope.metrics.length === 0) {
        return "metrics";
      }
    };

    $scope.dereg = $scope.$watch('workspace.selection', render);

    function render() {
      var node = workspace.selection;
      if (!angular.isDefined(node) || !angular.isDefined($scope.updateRate) || $scope.updateRate === 0) {
        return;
      }
      var width = 594;
      var charts = $($element);
      if (charts) {
        width = charts.width();
      } else {
        return;
      }

      var mbean = node.objectName;
      $scope.metrics = [];

      var context = cubism.context()
              .serverDelay($scope.updateRate)
              .clientDelay($scope.updateRate)
              .step($scope.updateRate)
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
        // if we've children and none of the query arguments matched any metrics
        // lets redirect back to the edit view
        if (node.children.length && !$scope.metrics.length) {
          // lets forward to the chart selection UI if we have some children; they may have
          // chartable attributes
          $location.path("jmx/chartEdit");
        }
      }

      var d3Selection = d3.select($element[0]);
      if ($scope.metrics.length > 0) {
        d3Selection.selectAll(".axis")
                .data(["top", "bottom"])
                .enter().append("div")
                .attr("class", function (d) {
                  return d + " axis";
                })
                .each(function (d) {
                  d3.select(this).call(context.axis().ticks(12).orient(d));
                });

        d3Selection.append("div")
                .attr("class", "rule")
                .call(context.rule());

        context.on("focus", function (i) {
          d3Selection.selectAll(".value").style("right", i === null ? null : context.size() - i + "px");
        });

        $scope.metrics.forEach((metric) => {
          d3Selection.call(function (div) {
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
