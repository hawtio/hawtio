/**
 * @module Jmx
 */
module Jmx {
  export function ChartController($scope, $element, $location, workspace:Workspace, localStorage, jolokiaUrl, jolokiaParams) {


    $scope.metrics = [];
    $scope.updateRate = 1000; //parseInt(localStorage['updateRate']);

    $scope.context = null;
    $scope.jolokia = null;
    $scope.charts = null;

    $scope.reset = () => {
      if ($scope.context) {
        $scope.context.stop();
        $scope.context = null;
      }
      if ($scope.jolokia) {
        $scope.jolokia.stop();
        $scope.jolokia = null;
      }
      if ($scope.charts) {
        $scope.charts.empty();
        $scope.charts = null;
      }
    };

    $scope.$on('$destroy', function () {
      try {
        $scope.deregRouteChange();
      } catch (error) {
        // ignore
      }
      try {
        $scope.dereg();
      } catch (error) {
        // ignore
      }
      $scope.reset();

    });

    $scope.errorMessage = () => {
      if ($scope.updateRate === 0) {
        return "updateRate";
      }

      if ($scope.metrics.length === 0) {
        return "metrics";
      }
    };

    $scope.deregRouteChange = $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      Core.throttled(render, 500)();
    });
    $scope.dereg = $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      Core.throttled(render, 500)();
    });

    Core.throttled(render, 500)();


    function render() {

      var node = workspace.selection;
      if (!angular.isDefined(node) || !angular.isDefined($scope.updateRate) || $scope.updateRate === 0) {
        // Called render too early, let's retry
        setTimeout(Core.throttled(() => {
          render();
          Core.$apply($scope);
        }, 500), 1000);
        return;
      }
      var width = 594;
      var charts = $element.find('#charts');
      if (charts) {
        width = charts.width();
      } else {
        // Called render too early, let's retry
        setTimeout(Core.throttled(() => {
          render();
          Core.$apply($scope);
        }, 500), 1000);
        return;
      }

      $scope.charts = charts;
      // clear out the existing context to ensure we don't get duplicates
      $scope.reset();

      $scope.jolokia = new Jolokia(jolokiaParams);
      $scope.jolokia.start($scope.updateRate);

      var mbean = node.objectName;
      $scope.metrics = [];

      var context = cubism.context()
              .serverDelay($scope.updateRate)
              .clientDelay($scope.updateRate)
              .step($scope.updateRate)
              .size(width);

      $scope.context = context;
      $scope.jolokiaContext = context.jolokia($scope.jolokia);
      var search = $location.search();
      var attributeNames = toSearchArgumentArray(search["att"]);

      if (mbean) {
        // TODO make generic as we can cache them; they rarely ever change
        // lets get the attributes for this mbean

        // we need to escape the mbean path for list
        var listKey = encodeMBeanPath(mbean);
        //console.log("Looking up mbeankey: " + listKey);
        var meta = $scope.jolokia.list(listKey);
        if (meta) {
          var attributes = meta.attr;
          if (attributes) {
            var foundNames = [];
            for (var key in attributes) {
              var value = attributes[key];
              if (value) {
                var typeName = value['type'];
                if (isNumberTypeName(typeName)) {
                  foundNames.push(key);
                }
              }
            }

            // lets filter the attributes
            // if we find none then the att search attribute is invalid
            // so lets discard the filter - as it must be for some other mbean
            if (attributeNames.length) {
              var filtered = foundNames.filter((key) => attributeNames.indexOf(key) >= 0);
              if (filtered.length) {
                foundNames = filtered;
              }
            }
            angular.forEach(foundNames, (key) => {
              var metric = $scope.jolokiaContext.metric({
                type: 'read',
                mbean: mbean,
                attribute: key
              }, humanizeValue(key));
              if (metric) {
                $scope.metrics.push(metric);
              }
            });
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
            if (!child && node.children) {
              child = node.children.find(n => elementName === n["title"]);
            }
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

      var d3Selection = d3.select(charts.get(0));
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
