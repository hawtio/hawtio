module Insight {

    // create our angular module and tell angular what route(s) it will handle
    var insightPlugin = angular.module('insight', ['hawtioCore'])
      .config(function($routeProvider) {
        $routeProvider.
          when('/insight/all', { templateUrl: 'app/insight/html/all.html' }).
          when('/insight/jvms', { templateUrl: 'app/insight/html/jvms.html' }).
          when('/insight/elasticsearch', { templateUrl: 'app/insight/html/elasticsearch.html' });
    });


    insightPlugin.run(function(workspace, viewRegistry, jolokia, layoutFull) {

        viewRegistry["insight"] = "app/insight/html/layoutInsight.html";

        // instead lets add the Metrics link on the Fabric sub nav bar

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
          content: "Metrics",
          title: "View Insight metrics",
          href: () => "#/insight/all",
          isValid: (workspace:Workspace) => { return true; }
        });

        var containerId = null;
        Fabric.containerWebAppURL(jolokia, "org.fusesource.insight.insight-kibana3", containerId, onKibanaUrl, onKibanaUrl);
        Fabric.containerWebAppURL(jolokia, "org.fusesource.insight.insight-eshead", containerId, onEsHeadUrl, onEsHeadUrl);

        function onKibanaUrl(response) {
          var url = response ? response.value : null;
          console.log("========== onKibanaUrl: " + url);
          workspace.topLevelTabs.push({
              content: "Logs",
              title: "View Insight logs",
              href: () => url,
              isValid: (workspace:Workspace) => { return true; }
          })
        }

        function onEsHeadUrl(response) {
          var url = response ? response.value : null;
          console.log("========== onEsHeadUrl: " + url);
          workspace.topLevelTabs.push({
              content: "ElasticSearch",
              title: "View ElasticSearch raw data",
              href: () => url,
              isValid: (workspace:Workspace) => { return true; }
          })
        }

    });

    // tell the hawtio plugin loader about our plugin so it can be
    // bootstrapped with the rest of angular
    hawtioPluginLoader.addModule('insight');

}

