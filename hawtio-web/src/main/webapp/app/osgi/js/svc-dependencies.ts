module Osgi {
    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        osgiDataService.register(function() {
            createGraph();
            Core.$apply($scope);
        });

        $scope.graph = {
            nodes: {},
            links: []
        }

        function createGraph() {

            var graphBuilder = new ForceGraph.GraphBuilder();

            var bundles = osgiDataService.getBundles();

            bundles.forEach((bundle) => {

               if (bundle.RegisteredServices.length > 0 || bundle.ServicesInUse.length > 0) {

                   var bundleNodeId = "Bundle-" + bundle.Identifier;
                   var bundleNode = {
                       id: bundleNodeId,
                       name: bundle.SymbolicName
                   }

                   bundle.RegisteredServices.forEach((sid) => {

                       var svcNodeId = "Service-" + sid;
                       var svcNode = {
                           id: svcNodeId,
                           name: "" + sid
                       };

                       graphBuilder.addLink(bundleNode, svcNode, "registered");
                   });

                   bundle.ServicesInUse.forEach((sid) => {

                       var svcNodeId = "Service-" + sid;
                       var svcNode = {
                           id: svcNodeId,
                           name: "" + sid
                       };

                       graphBuilder.addLink(bundleNode, svcNode, "inuse");
                   });
               }
            });

            $scope.graph = graphBuilder.buildGraph();

        }
    }

}
