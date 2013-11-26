/**
 * @module Osgi
 */
module Osgi {

    export class OsgiGraphBuilder {

        private osgiDataService : OsgiDataService;
        private bundleFilter : String;
        private packageFilter : String;
        private showServices : boolean;
        private showPackages : boolean;
        private hideUnused   : boolean;
        private graphBuilder : ForceGraph.GraphBuilder;

        private filteredBundles = {};
        private bundles = null;
        private services = null;
        private packages = null;

        private PREFIX_BUNDLE = "Bundle-";
        private PREFIX_SVC    = "Service-";
        private PREFIX_PKG    = "Package-";

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

        getPackages() {
            if (this.packages == null) {
                this.packages = this.osgiDataService.getPackages();
            }
            return this.packages;
        }

        bundleNodeId(bundle) {
            return this.PREFIX_BUNDLE + bundle.Identifier;
        }

        serviceNodeId(service) {
            return this.PREFIX_SVC + service.Identifier;
        }

        pkgNodeId(pkg) {
            return this.PREFIX_PKG + pkg.Name + "-" + pkg.Version;
        }

        // Create a service node from a given service
        buildSvcNode(service) {

            return {
                id: this.serviceNodeId(service),
                name: "" + service.Identifier,
                type: "service",
                used: false,
//                image: {
//                    url: "/hawtio/app/osgi/img/service.png",
//                    width: 32,
//                    height:32
//                },
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
        }

        // Create a bundle node for a given bundle
        buildBundleNode(bundle) {

            return {
                id: this.bundleNodeId(bundle),
                name: bundle.SymbolicName,
                type: "bundle",
                used: false,
                navUrl: "#/osgi/bundle/" + bundle.Identifier,
//                image: {
//                    url: "/hawtio/app/osgi/img/bundle.png",
//                    width: 32,
//                    height:32
//                },
                popup : {
                    title: "Bundle [" + bundle.Identifier + "]",
                    content: "<p>" + bundle.SymbolicName + "<br/>Version " + bundle.Version + "</p>"
                }
            }
        }

        buildPackageNode(pkg) {

            return {
                id: this.pkgNodeId(pkg),
                name: pkg.Name,
                type: "package",
                used: false,
                popup: {
                    title: "Package [" + pkg.Name + "]",
                    content: "<p>" + pkg.Version + "</p>"
                }
            }
        }

        exportingBundle(pkg) {

            var result = null;

            pkg.ExportingBundles.forEach( (bundleId) => {
                if (this.filteredBundles[this.PREFIX_BUNDLE + bundleId] != null) {
                    result = bundleId;
                }
            })
            return result;
        }

        addFilteredBundles() {

            d3.values(this.getBundles()).forEach( (bundle) => {

                if (this.bundleFilter == null || this.bundleFilter == "" || bundle.SymbolicName.startsWith(this.bundleFilter)) {
                    var bundleNode = this.buildBundleNode(bundle);

                    this.filteredBundles[bundleNode.id] = bundle;

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

        addFilteredServices() {
            if (this.showServices) {
                d3.values(this.getBundles()).forEach( (bundle) => {

                    bundle.ServicesInUse.forEach( (sid) => {

                        var svcNodeId = this.PREFIX_SVC + sid;

                        if (this.graphBuilder.getNode(svcNodeId) != null) {

                            this.graphBuilder.getNode(svcNodeId).used = true;

                            var bundleNode = this.graphBuilder.getNode(this.bundleNodeId(bundle)) || this.buildBundleNode(bundle);
                            bundleNode.used = true;

                            this.graphBuilder.addNode(bundleNode);
                            this.graphBuilder.addLink(svcNodeId, bundleNode.id, "inuse");
                        }
                    })
                })
            }
        }

        addFilteredPackages() {

            if (this.showPackages) {
                d3.values(this.getPackages()).forEach( (pkg) => {

                    if (this.packageFilter == null || this.packageFilter == "" || pkg.Name.startsWith(this.packageFilter)) {
                        var exportingId = this.exportingBundle(pkg);

                        if (exportingId != null) {

                            var bundleNode = this.graphBuilder.getNode(this.PREFIX_BUNDLE + exportingId);
                            bundleNode.used = true;

                            var pkgNode = this.buildPackageNode(pkg);

                            this.graphBuilder.addNode(pkgNode);
                            this.graphBuilder.addLink(bundleNode.id, pkgNode.id, "registered");

                            pkg.ImportingBundles.forEach( (bundleId) => {

                                var bundleNode = this.graphBuilder.getNode(this.PREFIX_BUNDLE  + bundleId) || this.buildBundleNode(this.getBundles()[bundleId]);
                                bundleNode.used = true;
                                pkgNode.used = true;

                                this.graphBuilder.addNode(bundleNode);
                                this.graphBuilder.addLink(bundleNode.id, pkgNode.id, "inuse");
                            })
                        }
                    }
                })
            }
        }

        public buildGraph() {

            this.addFilteredBundles();
            this.addFilteredServices();
            this.addFilteredPackages();

            if (this.hideUnused) {

                // this will filter out all nodes that are not marked as used in our data model
                this.graphBuilder.filterNodes( (node) => { return node.used; });

                // this will remove all nodes that do not have connections after filtering the unused nodes
                this.graphBuilder.filterNodes( (node) => { return this.graphBuilder.hasLinks(node.id); });
            }

            return this.graphBuilder.buildGraph();
        }
    }

}
