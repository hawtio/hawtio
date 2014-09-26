/**
 * @module Insight
 */
module Insight {

  export var managerMBean = "io.fabric8:type=Fabric";

  export var allContainers = { id: '-- all --' };

  export function hasInsight(workspace) {
    return workspace.treeContainsDomainAndProperties('org.elasticsearch', {service: 'restjmx'});
  }

  export function getInsightMetricsCollectorMBean(workspace) {
    var node = workspace.findMBeanWithProperties('io.fabric8.insight', {type: 'MetricsCollector'});
    if (!node) {
      node = workspace.findMBeanWithProperties('org.fusesource.insight', {type: 'MetricsCollector'});
    }
    return node ? node.objectName : null;
  }

  export function getChildren(node, type, field, hasHost) {
    var children = [ ];
    for (var p in node["properties"]) {
      var obj = node["properties"][p];
      if (obj["type"] === 'long' || obj["type"] === 'double') {
        children.push({ title: p, field: field + p, type: type, hasHost: hasHost });
      } else if (obj["properties"]) {
        children.push({ title: p, isFolder: true, children: getChildren(obj, type, field + p + ".", hasHost) });
      }
    }
    return children;
  }

  export function createCharts($scope, chartsDef, element, jolokia) {

    var chartsDiv = $(element);
    var width = chartsDiv.width() - 80;

    var context = cubism.context()
      .serverDelay(interval_to_seconds('1m') * 1000)   // insight only gather stats every minute
      .clientDelay($scope.updateRate)
      .step(interval_to_seconds($scope.timespan) * 1000)
      .size(width);

    var d3Selection = d3.select(chartsDiv[0]);
    d3Selection.html("");
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

    chartsDef.forEach(function (chartDef) {
      d3Selection.call(function (div) {
        div.append("div")
          .data([ chart(context, chartDef, jolokia) ])
          .attr("class", "horizon")
          .call(context.horizon());
      });
    });

  }

  function chart(context, chartDef, jolokia) {

    return context.metric(function (start:number, stop:number, step, callback) {
      var values = [],
        value = 0,
        start:number = +start,
        stop:number = +stop;
      var range = {
        range: {
          timestamp: {
            from: new Date(start).toISOString(),
            to: new Date(stop).toISOString()
          }
        }
      };
      var filter;
      if (chartDef.query) {
        filter = {
          fquery: {
            query: {
              filtered: {
                query: {
                  query_string: {
                    query: chartDef.query
                  }
                },
                filter: range
              }
            }
          }
        };
      } else {
        filter = range;
      }
      var request = {
        size: 0,
        facets: {
          histo: {
            date_histogram: {
              value_field: chartDef.field,
              key_field: "timestamp",
              interval: step + "ms"
            },
            facet_filter: filter
          }
        }
      };
      var jreq = { type: 'exec',
        mbean: 'org.elasticsearch:service=restjmx',
        operation: 'exec',
        arguments: [ 'POST', '/_all/' + chartDef.type + '/_search', JSON.stringify(request) ] };
      jolokia.request(jreq, { success: function (response) {
        var map = {};
        var data = jQuery.parseJSON(response.value)["facets"]["histo"]["entries"];
        data.forEach(function (entry) {
          map[ entry.time ] = entry.max;
        });
        var delta = 0;
        if (chartDef.meta !== undefined) {
          if (chartDef.meta['type'] === 'trends-up' || chartDef.meta['type'] === 'peak') {
            delta = +1;
          } else if (chartDef.meta['type'] === 'trends-down') {
            delta = -1;
          }
        }
        while (start < stop) {
          var v = 0;
          if (delta !== 0) {
            if (map[ start - step ] !== undefined) {
              var d = (map[ start ] - map[ start - step ]) * delta;
              v = d > 0 ? d : 0;
            }
          } else {
            if (map[ start ] !== undefined) {
              v = map[ start ];
            }
          }
          values.push(v);
          start += step;
        }
        callback(null, values);
      } });
    }, chartDef.name);

  }

  function interval_to_seconds(string) {
    var matches = string.match(/(\d+)([Mwdhms])/);
    switch (matches[2]) {
      case 'M':
        return matches[1] * 2592000;
        ;
      case 'w':
        return matches[1] * 604800;
        ;
      case 'd':
        return matches[1] * 86400;
        ;
      case 'h':
        return matches[1] * 3600;
        ;
      case 'm':
        return matches[1] * 60;
        ;
      case 's':
        return matches[1];
    }
  }

  function time_ago(string) {
    return new Date(new Date().getTime() - (interval_to_seconds(string) * 1000))
  }

}
