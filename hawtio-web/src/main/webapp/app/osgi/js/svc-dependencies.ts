module Osgi {
    export function ServiceDependencyController($scope, workspace:Workspace, osgiDataService: OsgiDataService) {

        osgiDataService.register(function() {
            createGraph();
            Core.$apply($scope);
        });

        $scope.addToDashboardLink = () => {
          var href="#/osgi/dependencies";
          var title="OSGi Dependencies";
          var size = angular.toJson({
            size_x: 2,
            size_y: 2
          });
          return "#/dashboard/add?tab=dashboard" +
              "&href=" + encodeURIComponent(href) +
              "&size=" + encodeURIComponent(size) +
              "&title=" + encodeURIComponent(title);
        };

        createGraph()

        function createGraph() {

            var buildSvcNode = (service) => {
                var svcNode = {
                    id: "Service-" + service.Identifier,
                    name: "" + service.Identifier,
                    type: "service",
                    image: {
                        url: "/hawtio/app/osgi/img/service.png",
                        width: 32,
                        height:32
                    },
                    popup : {
                        title: "Service [" + service.Identifier + "]",
                        content: (() => {

                            var result = "";

                            if (service != null) {
                                service.objectClass.forEach((clazz) => {
                                    if (result.length > 0) {
                                        result = result + "<br/>";
                                    }
                                    result = result + clazz;
                                })
                            }

                            return result;
                        })
                    }
                }

                return svcNode;
            };

            var buildBundleNode = (bundle) => {

                var bundleNodeId = "Bundle-" + bundle.Identifier;

                var bundleNode = {
                    id: bundleNodeId,
                    name: bundle.SymbolicName,
                    type: "bundle",
                    navUrl: "#/osgi/bundle/" + bundle.Identifier,
                    image: {
                        url: "/hawtio/app/osgi/img/bundle.png",
                        width: 32,
                        height:32
                    },
                    popup : {
                        title: "Bundle [" + bundle.Identifier + "]",
                        content: "<p>" + bundle.SymbolicName + "<br/>Version " + bundle.Version + "</p>"
                    }
                }

                return bundleNode;

            }

            var graphBuilder = new ForceGraph.GraphBuilder();

            var bundles = osgiDataService.getBundles();
            var services = osgiDataService.getServices();

            d3.values(services).forEach((service) => { graphBuilder.addNode(buildSvcNode(service)); })

            bundles.forEach((bundle) => {

               if (bundle.RegisteredServices.length > 0 || bundle.ServicesInUse.length > 0) {

                   var bundleNode = buildBundleNode(bundle);

                   graphBuilder.addNode(bundleNode);

                   bundle.RegisteredServices.forEach((sid) => {
                       var svcNodeId = "Service-" + sid;
                       graphBuilder.addLink(bundleNode.id, svcNodeId, "registered");
                   });

                   bundle.ServicesInUse.forEach((sid) => {

                       var svcNodeId = "Service-" + sid;
                       graphBuilder.addLink(bundleNode.id, svcNodeId, "inuse");
                   });
               }
            });

            $scope.graph = graphBuilder.buildGraph();
        }
    }

}
