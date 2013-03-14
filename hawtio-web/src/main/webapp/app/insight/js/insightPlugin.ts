module Insight {

    // create our angular module and tell angular what route(s) it will handle
    var insightPlugin = angular.module('insight', ['hawtioCore'])
      .config(function($routeProvider) {
        $routeProvider.
          when('/insight/all', { templateUrl: 'app/insight/html/all.html' }).
          when('/insight/jvms', { templateUrl: 'app/insight/html/jvms.html' }).
          when('/insight/elasticsearch', { templateUrl: 'app/insight/html/elasticsearch.html' });
    });


    insightPlugin.run(function(workspace, viewRegistry, layoutFull) {

        viewRegistry["insight"] = "app/insight/html/layoutInsight.html";

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
          content: "Insight",
          title: "Insight plugin loaded dynamically",
          isValid: function() { return true; },
          href: function() { return "#/insight/all"; },
          isActive: function() { return workspace.isLinkActive("insight"); }
        });

    });

    // tell the hawtio plugin loader about our plugin so it can be
    // bootstrapped with the rest of angular
    hawtioPluginLoader.addModule('insight');

}

