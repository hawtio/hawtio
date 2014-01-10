/**
 * @module ElasticSearch
 * @main ElasticSearch
 */
module ES {

    var pluginName = 'elasticsearch';
    var base_url = 'app/elasticsearch/html';

    /* Application level module which depends on filters, controllers, and services */
    angular.module(pluginName, ['bootstrap', 'ngResource', 'elasticjs.service', 'dangle'])

            .config(['$routeProvider', function ($routeProvider) {
                $routeProvider
/*
                        .when('/elasticsearch/search', {templateUrl: base_url + '/search.html'})
                        .when('/elasticsearch/results', {templateUrl: base_url + '/results.html'})
*/
                        .when('/elasticsearch', {templateUrl: base_url + '/es.html'})
            }])

            .run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

                // Use Full Layout of Hawtio
                viewRegistry[pluginName] = 'app/elasticsearch/html/es.html';

                helpRegistry.addUserDoc(pluginName, 'app/elasticsearch/doc/help.md', () => {
                  // TODO not sure how this plugin actually shows up in the toolbar
                  return false;
                });

                /*
                 // Set up top-level link to our plugin
                 workspace.topLevelTabs.push({
                 content: "ElasticSearch",
                 title: "ElasticSearch",
                 isValid: (workspace) => true,
                 href: () => '#/elasticsearch',
                 isActive: (workspace:Workspace) => workspace.isLinkActive("elasticsearch")
                 });
                 */

            });

    hawtioPluginLoader.addModule(pluginName);
}
