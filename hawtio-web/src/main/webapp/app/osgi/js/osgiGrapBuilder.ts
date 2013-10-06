module Osgi {

    export class OsgiGraphBuilder {

        private osgiDataService : OsgiDataService;
        private bundleFilter : String;
        private packageFilter : String;
        private showServices : boolean;
        private showPackages : boolean;
        private hideUnused   : boolean;

        constructor(
            osgiDataService: OsgiDataService,
            bundleFilter: String,
            packageFilter: String,
            showServices: boolean,
            showPackages: boolean,
            hideUnused: boolean
            ) {
                this.osgiDataService = osgiDataService;
                this.bundleFilter = bundleFilter;
                this.packageFilter = packageFilter;
                this.showServices = showServices;
                this.showPackages = showPackages;
                this.hideUnused = hideUnused;
        }

        // Create a service node from a given service
        buildSvcNode(service) {

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
        }

        // Create a bundle node for a given bundle
        buildBundleNode(bundle) {

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

        public buildGraph() {
            var graphBuilder = new ForceGraph.GraphBuilder();

            var bundles = this.osgiDataService.getBundles();
            var services = this.osgiDataService.getServices();

            d3.values(services).forEach((service) => { graphBuilder.addNode(this.buildSvcNode(service)); })

            bundles.forEach((bundle) => {

                if (bundle.RegisteredServices.length > 0 || bundle.ServicesInUse.length > 0) {

                    var bundleNode = this.buildBundleNode(bundle);

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

            return graphBuilder.buildGraph();
        }
    }

}