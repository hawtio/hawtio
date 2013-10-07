module Osgi {

    export class OsgiGraphBuilder {

        private osgiDataService : OsgiDataService;
        private bundleFilter : String;
        private packageFilter : String;
        private showServices : boolean;
        private showPackages : boolean;
        private hideUnused   : boolean;
        private graphBuilder : ForceGraph.GraphBuilder;

        private bundles = null;
        private services = null;
        private packages = null;

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

                this.graphBuilder = new ForceGraph.GraphBuilder();
        }

        getBundles() {
            if (this.bundles == null) {
                this.bundles = this.osgiDataService.getBundles();
            }
            return this.bundles;
        }

        getServices() {
            if (this.services == null) {
                this.services = this.osgiDataService.getServices();
            }
            return this.services;
        }

        // Create a service node from a given service
        buildSvcNode(service) {

            var svcNode = {
                id: "Service-" + service.Identifier,
                name: "" + service.Identifier,
                type: "service",
                used: false,
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
                used: false,
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

        addFilteredBundles() {

            d3.values(this.getBundles()).forEach( (bundle) => {

                if (this.bundleFilter == null || this.bundleFilter == "" || bundle.SymbolicName.startsWith(this.bundleFilter)) {
                    var bundleNode = this.buildBundleNode(bundle);
                    bundleNode.used = true;

                    this.graphBuilder.addNode(bundleNode);

                    if (this.showServices) {
                        var services = this.getServices();

                        bundle.RegisteredServices.forEach( (sid) => {
                            var svcNode = this.buildSvcNode(services[sid]);
                            this.graphBuilder.addNode(svcNode);
                            this.graphBuilder.addLink(bundleNode.id, svcNode.id, "registered");
                        })
                    }
                }
            })
        }

        public buildGraph() {

            this.addFilteredBundles();

            if (this.showServices) {
                d3.values(this.getBundles()).forEach( (bundle) => {
                    var bundleNode = this.buildBundleNode(bundle);

                    bundle.ServicesInUse.forEach( (sid) => {
                        var svcNode = this.buildSvcNode((this.getServices())[sid]);

                        if (this.graphBuilder.getNode(svcNode.id) != null) {

                            this.graphBuilder.getNode(svcNode.id).used = true;
                            bundleNode.used = true;

                            this.graphBuilder.addNode(bundleNode);
                            this.graphBuilder.addLink(bundleNode.id, svcNode.id, "inuse");
                        }
                    })
                })
            }

            if (this.hideUnused) {
                this.graphBuilder.filterNodes( (node) => { return node.used; });
                this.graphBuilder.filterNodes( (node) => { return this.graphBuilder.hasLinks(node.id); });
            }

            return this.graphBuilder.buildGraph();
        }
    }

}