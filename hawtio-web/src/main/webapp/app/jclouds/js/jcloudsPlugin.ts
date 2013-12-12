/**
 * @module Jclouds
 * @main Jclouds
 */
module Jclouds {
    var pluginName = 'jclouds';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'ngGrid', 'hawtioCore']).config(($routeProvider) => {
        $routeProvider.
            when('/jclouds/api', {templateUrl: 'app/jclouds/html/api-list.html'}).
            when('/jclouds/api/:apiId', {templateUrl: 'app/jclouds/html/api.html'}).
            when('/jclouds/provider', {templateUrl: 'app/jclouds/html/provider-list.html'}).
            when('/jclouds/provider/:providerId', {templateUrl: 'app/jclouds/html/provider.html'}).
            when('/jclouds/compute/service', {templateUrl: 'app/jclouds/html/compute/compute-service-list.html'}).
            when('/jclouds/compute/service/:computeId', {templateUrl: 'app/jclouds/html/compute/compute-service.html'}).
            when('/jclouds/compute/node/:computeId', {templateUrl: 'app/jclouds/html/compute/node-list.html'}).
            when('/jclouds/compute/node/:computeId/*nodeId', {templateUrl: 'app/jclouds/html/compute/node.html'}).
            when('/jclouds/compute/image/:computeId', {templateUrl: 'app/jclouds/html/compute/image-list.html'}).
            when('/jclouds/compute/image/:computeId/*imageId', {templateUrl: 'app/jclouds/html/compute/image.html'}).
            when('/jclouds/compute/hardware/:computeId', {templateUrl: 'app/jclouds/html/compute/hardware-list.html'}).
            when('/jclouds/compute/hardware/:computeId/*hardwareId', {templateUrl: 'app/jclouds/html/compute/hardware.html'}).
            when('/jclouds/compute/location/:computeId', {templateUrl: 'app/jclouds/html/compute/location-list.html'}).
            when('/jclouds/compute/location/:computeId/*locationId', {templateUrl: 'app/jclouds/html/compute/location.html'}).
            when('/jclouds/blobstore/service', {templateUrl: 'app/jclouds/html/blobstore/blobstore-service-list.html'}).
            when('/jclouds/blobstore/service/:blobstoreId', {templateUrl: 'app/jclouds/html/blobstore/blobstore-service.html'}).
            when('/jclouds/blobstore/location/:blobstoreId', {templateUrl: 'app/jclouds/html/blobstore/location-list.html'}).
            when('/jclouds/blobstore/location/:blobstoreId/*locationId', {templateUrl: 'app/jclouds/html/blobstore/location.html'}).
            when('/jclouds/blobstore/container/:blobstoreId', {templateUrl: 'app/jclouds/html/blobstore/container-list.html'}).
            when('/jclouds/blobstore/container/:blobstoreId/:containerId', {templateUrl: 'app/jclouds/html/blobstore/container.html'}).
            when('/jclouds/blobstore/container/:blobstoreId/:containerId/*directory', {templateUrl: 'app/jclouds/html/blobstore/container.html'})
    }).
        run((workspace:Workspace, viewRegistry, helpRegistry) => {

            viewRegistry['jclouds'] = "app/jclouds/html/layoutJclouds.html";
            helpRegistry.addUserDoc('jclouds', 'app/' + 'jclouds' + '/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties("org.jclouds");
            });


            workspace.topLevelTabs.push({
                id: "jclouds",
                content: "jclouds",
                title: "Visualise and manage the Jclouds Compute/BlobStore providers and apis",
                isValid: (workspace:Workspace) => workspace.treeContainsDomainAndProperties("org.jclouds"),
                href: () => "#/jclouds/api",
                isActive: (workspace:Workspace) => workspace.isLinkActive("jclouds")
            });


        });

    hawtioPluginLoader.addModule(pluginName);
}
