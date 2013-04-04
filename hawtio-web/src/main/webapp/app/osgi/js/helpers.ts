module Osgi {

    export function defaultBundleValues(workspace:Workspace, $scope, values) {
        angular.forEach(values, (row) => {
            row["ExportData"] = handleExportedPackages(row["ExportedPackages"]);
            row["IdentifierLink"] = bundleLinks(workspace, row["Identifier"]);
            row["Hosts"] = bundleLinks(workspace, row["Hosts"]);
            row["Fragments"] = bundleLinks(workspace, row["Fragments"]);
            row["ImportedPackages"] = row["ImportedPackages"].union([]);
            row["StateStyle"] = getStateStyle("label", row["State"]);
            row["RequiringBundles"] = bundleLinks(workspace, row["RequiringBundles"]);
        });
        return values;
    }

    export function getStateStyle(prefix : string, state : string) : string {
        switch(state) {
            case "INSTALLED":
                return prefix + "-important";
            case "RESOLVED":
                return prefix + "-inverse";
            case "STARTING":
                return prefix + "-warning";
            case "ACTIVE":
                return prefix + "-success";
            case "STOPPING":
                return prefix + "-info";
            case "UNINSTALLED":
                return ""; // the default color, which is grey
            default:
                return prefix + "-important";
        }
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

    export function handleExportedPackages(packages : string[]) : {} {
        var result = {};
        for (var i = 0; i < packages.length; i++) {
            var exported = packages[i];
            var idx = exported.indexOf(";");
            if (idx > 0) {
                var name = exported.substring(0, idx);
                var ver = exported.substring(idx + 1)
                var data = result[name];
                if (data === undefined) {
                    data = {};
                    result[name] = data;
                }
                data["ReportedVersion"] = ver;
            }
        }
        return result;
    }

    export function parseExportPackageHeaders(headers : {}) : {} {
        var result = {};
        var data = {}

        var hdr = headers["Export-Package"];
        if (hdr === undefined) {
            return result;
        }
        var ephdr = hdr.Value;
        var inPkg = true;
        var inQuotes = false;
        var pkgName = "";
        var daDecl = "";
        for (var i = 0; i < ephdr.length; i++) {
            var c = ephdr.charAt(i);
            if (c === '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (inQuotes) {
                daDecl += c;
                continue;
            }

            // from here on we are never inside quotes
            if (c === ';') {
                if (inPkg) {
                    inPkg = false;
                } else {
                    handleDADecl(data, daDecl);

                    // reset directive and attribute variable
                    daDecl = "";
                }
                continue;
            }

            if (c === ',') {
                handleDADecl(data, daDecl);
                result[pkgName] = data;

                // reset data
                data = {};
                pkgName = "";
                daDecl = "";
                inPkg = true;
                continue;
            }

            if (inPkg) {
                pkgName += c;
            } else {
                daDecl += c;
            }
        }
        handleDADecl(data, daDecl);
        result[pkgName] = data;

        return result;
    }

    function handleDADecl(data : {}, daDecl : string) : void {
        var didx = daDecl.indexOf(":=");
        if (didx > 0) {
            data["D" + daDecl.substring(0, didx)] = daDecl.substring(didx + 2);
            return;
        }

        var aidx = daDecl.indexOf("=");
        if (aidx > 0) {
            data["A" + daDecl.substring(0, aidx)] = daDecl.substring(aidx + 1);
            return;
        }
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
        var sorted = toCollection(values).sort((a,b) => {return a-b});
        angular.forEach(sorted, function (value, key) {
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
            return Osgi.findFirstObjectName(folder);
        }
        return null;
    }

    /**
     * Walks the tree looking in the first child all the way down until we find an objectName
     */
    export function findFirstObjectName(node) {
        if (node) {
            var answer = node.objectName;
            if (answer) {
                return answer;
            } else {
                var children = node.children;
                if (children && children.length) {
                    return findFirstObjectName(children[0]);
                }
            }
        }
        return null;
    }

    export function getSelectionFrameworkMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "framework");
            return Osgi.findFirstObjectName(folder);
        }
        return null;
    }
    export function getSelectionServiceMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "serviceState");
            return Osgi.findFirstObjectName(folder);
        }
        return null;
    }

    export function getSelectionPackageMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.core", "packageState");
            return Osgi.findFirstObjectName(folder);
        }
        return null;
    }

    export function getSelectionConfigAdminMBean(workspace:Workspace):string {
        if (workspace) {
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("osgi.compendium", "cm");
            return Osgi.findFirstObjectName(folder);
        }
        return null;
    }

    export function getHawtioOSGiMBean(workspace:Workspace):string {
        if (workspace) {
            var mbeanTypesToDomain = workspace.mbeanTypesToDomain || {};
            var gitFacades = mbeanTypesToDomain["OSGiTools"] || {};
            var hawtioFolder = gitFacades["io.hawt.osgi"] || {};
            return hawtioFolder["objectName"];
        }
        return null;
    }
}
