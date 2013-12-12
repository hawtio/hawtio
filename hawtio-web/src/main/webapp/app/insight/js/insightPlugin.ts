/**
 * @module Insight
 * @main Insight
 */
module Insight {

    // create our angular module and tell angular what route(s) it will handle
    var insightPlugin = angular.module('insight', ['hawtioCore'])
      .config(function($routeProvider) {
        $routeProvider.
          when('/insight/all', { templateUrl: 'app/insight/html/all.html' }).
          when('/insight/jvms', { templateUrl: 'app/insight/html/jvms.html' }).
          when('/insight/elasticsearch', { templateUrl: 'app/insight/html/elasticsearch.html' });
    });


    insightPlugin.run(function(workspace, viewRegistry, helpRegistry) {

        viewRegistry["insight"] = "app/insight/html/layoutInsight.html";
        helpRegistry.addUserDoc('insight', 'app/insight/doc/help.md', () => {
          return Fabric.hasFabric(workspace) &&
              workspace.treeContainsDomainAndProperties("org.elasticsearch", { service: "restjmx"});
        });



      // instead lets add the Metrics link on the Fabric sub nav bar

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
          id: "insight",
          content: "Metrics",
          title: "View Insight metrics",
          href: () => "#/insight/all",
          isValid: (workspace:Workspace) => { return Fabric.hasFabric(workspace) && workspace.treeContainsDomainAndProperties("org.elasticsearch", { service: "restjmx"}); }
        });

    });

    // tell the hawtio plugin loader about our plugin so it can be
    // bootstrapped with the rest of angular
    hawtioPluginLoader.addModule('insight');

}

