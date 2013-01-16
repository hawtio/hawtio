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
}