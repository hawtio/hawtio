/**
 * @module ElasticSearch
 * @main ElasticSearch
 */
module ES {

    var pluginEsName = 'elasticjs';
    var base_url = 'app/elasticsearch/html';

    /* Application level module which depends on filters, controllers, and services */
    angular.module(pluginEsName, ['bootstrap', 'ngResource', 'elasticjs.service', 'dangle'])

            .config(['$routeProvider', function ($routeProvider) {
                $routeProvider
                        .when('/search', {templateUrl: base_url + '/search.html'})
                        .when('/results', {templateUrl: base_url + '/results.html'})
                        .when('/elasticjs', {templateUrl: base_url + '/es.html'})
            }])

            .run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, helpRegistry) => {

                // Use Full Layout of Hawtio
                viewRegistry['elasticjs'] = 'app/elasticsearch/html/es.html';

                helpRegistry.addUserDoc('elasticjs', 'app/elasticsearch/doc/help.md', () => {
                  // TODO not sure how this plugin actually shows up in the toolbar
                  return false;
                });


                /*
                 // Set up top-level link to our plugin
                 workspace.topLevelTabs.push({
                 content: "ElasticJs",
                 title: "ElasticJs plugin loaded dynamically",
                 isValid: (workspace) => true,
                 href: () => '#/elasticjs',
                 isActive: (workspace:Workspace) => workspace.isLinkActive("elasticjs")
                 });
                 */

            });

    hawtioPluginLoader.addModule(pluginEsName);
}
