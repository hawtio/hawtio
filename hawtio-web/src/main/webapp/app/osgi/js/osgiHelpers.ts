/**
 * @module Osgi
 */
module Osgi {

  export var log:Logging.Logger = Logger.get("OSGi");

    export function defaultBundleValues(workspace:Workspace, $scope, values) {
        var allValues = values;
        angular.forEach(values, (row) => {
            row["ImportData"] = parseActualPackages(row["ImportedPackages"])
            row["ExportData"] = parseActualPackages(row["ExportedPackages"]);
            row["IdentifierLink"] = bundleLinks(workspace, row["Identifier"]);
            row["Hosts"] = labelBundleLinks(workspace, row["Hosts"], allValues);
            row["Fragments"] = labelBundleLinks(workspace, row["Fragments"], allValues);
            row["ImportedPackages"] = row["ImportedPackages"].union([]);
            row["StateStyle"] = getStateStyle("label", row["State"]);
            row["RequiringBundles"] = labelBundleLinks(workspace, row["RequiringBundles"], allValues);
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

        function onPackageEntry(packageEntry, row) {
          if (!row) row = packageEntry;
          var name = packageEntry["Name"];
          var version = packageEntry["Version"];
          if (name && !name.startsWith("#")) {
            packageEntry["VersionLink"] = "<a href='" + Core.url("#/osgi/package/" + name + "/" + version + workspace.hash()) + "'>" + version + "</a>";
            var importingBundles = row["ImportingBundles"] || packageEntry["ImportingBundles"];
            var exportingBundles = row["ExportingBundles"] || packageEntry["ExportingBundles"];
            packageEntry["ImportingBundleLinks"] = bundleLinks(workspace, importingBundles);
            packageEntry["ImportingBundleLinks"] = bundleLinks(workspace, importingBundles);
            packageEntry["ExportingBundleLinks"] = bundleLinks(workspace, exportingBundles);
            packages.push(packageEntry);
          }
        }

        // the values could contain a child 'values' array of objects so use those directly
        var childValues = values.values;
        if (childValues) {
          angular.forEach(childValues, onPackageEntry);
        }
        angular.forEach(values, (row) => {
            angular.forEach(row, (version) => {
                angular.forEach(version, (packageEntry) => {
                  onPackageEntry(packageEntry, row)
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
            map["PidLink"] = "<a href='" + Core.url("#/osgi/pid/" + row[0] + workspace.hash()) + "'>" + row[0] + "</a>";
            map["Bundle"] = row[1];
            array.push(map);
        });
        return array;
    }

    export function parseActualPackages(packages : string[]) : {} {
        var result = {};
        for (var i = 0; i < packages.length; i++) {
            var pkg = packages[i];
            var idx = pkg.indexOf(";");
            if (idx > 0) {
                var name = pkg.substring(0, idx);
                var ver = pkg.substring(idx + 1)
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

    export function parseManifestHeader(headers : {}, name : string) : {} {
        var result = {};
        var data = {}

        var hdr = headers[name];
        if (hdr === undefined) {
            return result;
        }
        var ephdr = hdr.Value;
        var inPkg = true;
        var inQuotes = false;
        var pkgName = "";
        var daDecl = "";
        for (var i = 0; i < ephdr.length; i++) {
            var c = ephdr[i];
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

    export function labelBundleLinks(workspace, values, allValues) {
        var answer = "";
        var sorted = toCollection(values).sort((a,b) => {return a-b});
        angular.forEach(sorted, function (value, key) {
            var prefix = "";
            if (answer.length > 0) {
                prefix = " ";
            }
            var info = allValues[value] || {};
            var labelText = info.SymbolicName;
            answer += prefix + "<a class='label' href='" + Core.url("#/osgi/bundle/" + value + workspace.hash()) + "'>" + labelText + "</a>";
        });
        return answer;
    }

    export function bundleLinks(workspace, values) {
        var answer = "";
        var sorted = toCollection(values).sort((a,b) => {return a-b});
        angular.forEach(sorted, function (value, key) {
            var prefix = "";
            if (answer.length > 0) {
                prefix = " ";
            }
            answer += prefix + "<a class='label' href='" + Core.url("#/osgi/bundle/" + value + workspace.hash()) + "'>" + value + "</a>";
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
            answer += prefix + "<a href='" + Core.url("#/osgi/bundle/" + value + workspace.hash()) + "'>" + value + "</a>";
        });
        return answer;
    }

    /**
     * Finds a bundle by id
     *
     * @method findBundle
     * @for Osgi
     * @param {String} bundleId
     * @param {Array} values
     * @return {any}
     *
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
     * @method findFirstObjectName
     * @for Osgi
     * @param {Folder} node
     * @return {String}
     *
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

    export function getMetaTypeMBean(workspace:Workspace):string {
        if (workspace) {
          var mbeanTypesToDomain = workspace.mbeanTypesToDomain;
          var typeFolder = mbeanTypesToDomain["MetaTypeFacade"] || {};
          var mbeanFolder = typeFolder["io.fabric8"] || {};
          return mbeanFolder["objectName"];
        }
        return null;
    }

    export function getProfileMetadataMBean(workspace:Workspace):string {
        if (workspace) {
          var mbeanTypesToDomain = workspace.mbeanTypesToDomain;
          var typeFolder = mbeanTypesToDomain["ProfileMetadata"] || {};
          var mbeanFolder = typeFolder["io.fabric8"] || {};
          return mbeanFolder["objectName"];
        }
        return null;
    }

    export function getHawtioOSGiToolsMBean(workspace:Workspace):string {
        if (workspace) {
            var mbeanTypesToDomain = workspace.mbeanTypesToDomain;
            var toolsFacades = mbeanTypesToDomain["OSGiTools"] || {};
            var hawtioFolder = toolsFacades["hawtio"] || {};
            return hawtioFolder["objectName"];
        }
        return null;
    }
    export function getHawtioConfigAdminMBean(workspace:Workspace):string {
        if (workspace) {
            var mbeanTypesToDomain = workspace.mbeanTypesToDomain;
            var typeFolder = mbeanTypesToDomain["ConfigAdmin"] || {};
            var mbeanFolder = typeFolder["hawtio"] || {};
            return mbeanFolder["objectName"];
        }
        return null;
    }


  /**
   * Creates a link to the given configuration pid and/or factoryPid
   */
    export function createConfigPidLink($scope, workspace, pid, isFactory = false) {
      return Core.url("#" + createConfigPidPath($scope, pid, isFactory) + workspace.hash())
    }

  /**
   * Creates a path to the given configuration pid and/or factoryPid
   */
    export function createConfigPidPath($scope, pid, isFactory = false) {
    var link = pid;
    var versionId = $scope.versionId;
    var profileId = $scope.profileId;
    if (versionId && versionId) {
      var configPage = isFactory ? "/newConfiguration/" : "/configuration/";
      return "/wiki/branch/" + versionId + configPage + link + "/" + $scope.pageId;
    } else {
      return "/osgi/pid/" + link;
    }
  }

  /**
   * A helper method which initialises a scope's jolokia to refer to a profile's jolokia if used in a Fabric
   * or use a local jolokia
   */
  export function initProfileScope($scope, $routeParams, $location, localStorage, jolokia, workspace, initFn = null) {
    Wiki.initScope($scope, $routeParams, $location);
    $scope.versionId = $routeParams.versionId || $scope.branch;
    $scope.profileId = $routeParams.profileId || Fabric.pagePathToProfileId($scope.pageId);
    if (!$scope.pageId) {
      $scope.pageId = Fabric.fabricTopLevel + Fabric.profilePath($scope.profileId)
    }

    if (!initFn) {
      initFn = () => null;
    }
    var versionId = $scope.versionId;
    var profileId = $scope.profileId;
    $scope.profileNotRunning = false;
    $scope.profileMetadataMBean = null;
    if (versionId && profileId) {
      $scope.inFabricProfile = true;
      $scope.configurationsLink = "/wiki/branch/" + versionId + "/configurations/" + $scope.pageId;
      $scope.profileMetadataMBean = getProfileMetadataMBean(workspace);
      if ($scope.profileMetadataMBean) {
        $scope.profileNotRunning = true;
        $scope.jolokia = jolokia;
        $scope.workspace = workspace;
        initFn();
      } else {
        Fabric.profileJolokia(jolokia, profileId, versionId, (profileJolokia) => {
          if (profileJolokia) {
            $scope.jolokia = profileJolokia;
            $scope.workspace = Core.createRemoteWorkspace(profileJolokia, workspace.jolokiaStatus, $location, localStorage);
          } else {
            // lets deal with the case we have no profile running right now so we have to have a plan B
            // for fetching the profile configuration metadata
            $scope.jolokia = jolokia;
            $scope.workspace = workspace;
            $scope.profileNotRunning = true;
            $scope.profileMetadataMBean = getProfileMetadataMBean(workspace);
          }
          initFn();
        });
      }
    } else {
      $scope.configurationsLink = "/osgi/configurations";
      $scope.jolokia = jolokia;
      $scope.workspace = workspace;
      initFn();
    }
  }

  export function getConfigurationProperties(workspace, jolokia, pid, onDataFn) {
    var mbean = getSelectionConfigAdminMBean(workspace);
    var answer = null;
    if (jolokia && mbean) {
      answer = jolokia.execute(mbean, 'getProperties', pid, onSuccess(onDataFn));
    }
    return answer;
  }

  /**
   * For a pid of the form "foo.generatedId" for a pid "foo" or "foo.bar" remove the "foo." prefix
   */
  export function removeFactoryPidPrefix(pid, factoryPid) {
    if (pid && factoryPid) {
      if (pid.startsWith(factoryPid)) {
        return pid.substring(factoryPid.length + 1);
      }
      var idx = factoryPid.lastIndexOf(".");
      if (idx > 0) {
        var prefix = factoryPid.substring(0, idx + 1);
        return Core.trimLeading(pid, prefix);
      }
    }
    return pid;
  }
}
