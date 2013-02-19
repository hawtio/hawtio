module Osgi {

    export function defaultBundleValues(workspace:Workspace, $scope, values) {
        angular.forEach(values, (row) => {
            row["IdentifierLink"] = bundleLinks(workspace, row["Identifier"]);
            row["Hosts"] = bundleLinks(workspace, row["Hosts"]);
            var state = row["State"];
            var img = "red-dot.png";
            if (state === "ACTIVE") {
                img = "green-dot.png";
            } else if (state === "INSTALLED") {
                img = "yellow-dot.png";
            } else if (state === "STOPPED") {
                img = "gray-dot.png";
            } else {
                img = "red-dot.png";
            }
            img = "img/dots/" + img;
            row["ImportedPackages"] = row["ImportedPackages"].union([]);
            row["stateImageHref"] = img;
            row["stateImageLink"] = "<img src='" + img + "' title='" + state + "'/> ";
        });
        return values;
    }

    export function defaultServiceValues(workspace:Workspace, $scope, values) {
        angular.forEach(values, (row) => {
            row["BundleIdentifier"] = bundleLinks(workspace, row["BundleIdentifier"]);
        });
        return values;
    }


    export function defaultPackageValues(workspace:Workspace, $scope, values) {
        var packages = [];
        angular.forEach(values, (row) => {
            angular.forEach(row, (version) => {
                angular.forEach(version, (packageEntry) => {
                    var name = packageEntry["Name"];
                    var version = packageEntry["Version"];
                    if (!name.startsWith("#")) {
                        packageEntry["VersionLink"] = "<a href='" + url("#/osgi/package/" + name +"/"+ version + workspace.hash()) + "'>" + version + "</a>";
                        packageEntry["ImportingBundleLinks"] = bundleLinks(workspace, row["ImportingBundles"]);
                        packageEntry["ImportingBundleLinks"] = bundleLinks(workspace, row["ImportingBundles"]);
                        packageEntry["ExportingBundleLinks"] = bundleLinks(workspace, row["ExportingBundles"]);
                        packages.push(packageEntry);
                    }

                });
            });
        });
        return packages;
    }


    export function defaultConfigurationValues(workspace:Workspace, $scope, values) {
        var array = [];
        angular.forEach(values, (row) => {
            var map = {};
            map["Pid"] = row[0];
            map["PidLink"] = "<a href='" + url("#/osgi/pid/" + row[0] + workspace.hash()) + "'>" + row[0] + "</a>";
            map["Bundle"] = row[1];
            array.push(map);
        });
        return array;
    }

    export function toCollection(values) {
        var collection = values;
        if (!angular.isArray(values)) {
            collection = [values];
        }
        return collection;
    }


    export function bundleLinks(workspace, values) {
        var answer = "";
        angular.forEach(toCollection(values), function (value, key) {
            var prefix = "";
            if (answer.length > 0) {
                prefix = " ";
            }
            answer += prefix + "<a href='" + url("#/osgi/bundle/" + value + workspace.hash()) + "'>" + value + "</a>";
        });
        return answer;
    }


    export function pidLinks(workspace, values) {
        var answer = "";
        angular.forEach(toCollection(values), function (value, key) {
            var prefix = "";
            if (answer.length > 0) {
                prefix = " ";
            }
            answer += prefix + "<a href='" + url("#/osgi/bundle/" + value + workspace.hash()) + "'>" + value + "</a>";
        });
        return answer;
    }

    /**
     * Default the values that are missing in the returned JSON
     */
    export function findBundle(bundleId, values) {
        var answer = "";
        angular.forEach(values, (row) => {
            var id = row["Identifier"];
            if (bundleId === id.toString()) {
                answer = row;
                return answer;
            }
        });
        return answer;
    }

    export function getSelectionBundleMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "bundleState");
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
            }
        }
        return null;
    }

    export function getSelectionFrameworkMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "framework");
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
            }
        }
        return null;
    }
    export function getSelectionServiceMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "serviceState");
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
            }
        }
        return null;
    }

    export function getSelectionPackageMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "packageState");
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
            }
        }
        return null;
    }

    export function getSelectionConfigAdminMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.compendium", "cm");
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
            }
        }
        return null;
    }
}