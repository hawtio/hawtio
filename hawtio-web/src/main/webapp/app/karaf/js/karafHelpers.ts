/**
 * @module Karaf
 */
module Karaf {

  export var log:Logging.Logger = Logger.get("Karaf");

  export function setSelect(selection, group) {
    if (!angular.isDefined(selection)) {
      return group[0];
    }
    var answer = group.findIndex(function (item) {
      return item.id === selection.id
    });
    if (answer !== -1) {
      return group[answer];
    } else {
      return group[0];
    }
  }

  export function installFeature(workspace, jolokia, feature, version, success, error) {
    jolokia.request(
            {
              type: 'exec', mbean: getSelectionFeaturesMBean(workspace),
              operation: 'installFeature(java.lang.String, java.lang.String)',
              arguments: [feature, version]
            },
            onSuccess(success, { error: error }));
  }

  export function uninstallFeature(workspace, jolokia, feature, version, success, error) {
    jolokia.request(
            {
              type: 'exec', mbean: getSelectionFeaturesMBean(workspace),
              operation: 'uninstallFeature(java.lang.String, java.lang.String)',
              arguments: [feature, version]
            },
            onSuccess(success, { error: error }));
  }

  // TODO move to core?
  export function toCollection(values) {
    var collection = values;
    if (!angular.isArray(values)) {
      collection = [values];
    }
    return collection;
  }

  export function featureLinks(workspace, name, version) {
    return  "<a href='" + url("#/karaf/feature/" + name + "/" + version + workspace.hash()) + "'>" + version + "</a>";
  }

  export function extractFeature(attributes, name, version) {
    var features = [];
    var repos = [];
    populateFeaturesAndRepos(attributes, features, repos);
    return features.find((feature) => {
      return feature.Name == name && feature.Version == version;
    });
    /*
    var f = {};
    angular.forEach(attributes["Features"], (feature) => {
      angular.forEach(feature, (entry) => {
        if (entry["Name"] === name && entry["Version"] === version) {
          var deps = [];
          populateDependencies(attributes, entry["Dependencies"], deps);
          f["Name"] = entry["Name"];
          f["Version"] = entry["Version"];
          f["Bundles"] = entry["Bundles"];
          f["Dependencies"] = deps;
          f["Installed"] = entry["Installed"];
          f["Configurations"] = entry["Configurations"];
          f["Configuration Files"] = entry["Configuration Files"];
          f["Files"] = entry["Configuration Files"];
        }
      });
    });
    return f;
    */
  }

  export function populateFeaturesAndRepos(attributes, features, repositories) {
    var fullFeatures = attributes["Features"];
    angular.forEach(attributes["Repositories"], (repo) => {

      repositories.push({
        id: repo["Name"],
        uri: repo["Uri"]
      });

      angular.forEach(repo["Features"], (feature) => {

        angular.forEach(feature, (entry) => {
          var f = Object.extended(fullFeatures[entry['Name']][entry['Version']]).clone();
          f["Id"] = entry["Name"] + "/" + entry["Version"];
          f["RepositoryName"] = repo["Name"];
          f["RepositoryURI"] = repo["Uri"];
          features.push(f);
        });

      });
    });
  }

    export function createScrComponentsView(workspace, jolokia, components) {
        var result = [];
        angular.forEach(components, (component) => {

            result.push({
                Name: component,
                State: getComponentStateDescription(getComponentState(workspace, jolokia, component))
            });
        });
        return result;
    }

    export function getComponentStateDescription(state) {
        switch (state) {
            case 2:
                return "Enabled";
            case 4:
                return "Unsatisfied";
            case 8:
                return "Activating";
            case 16:
                return "Active";
            case 32:
                return "Registered";
            case 64:
                return "Factory";
            case 128:
                return "Deactivating";
            case 256:
                return "Destroying";
            case 1024:
                return "Disabling";
            case 2048:
                return "Disposing";

        }
        return "Unknown";
    };

    export function getAllComponents(workspace, jolokia) {
        var scrMBean = getSelectionScrMBean(workspace)
        var response = jolokia.request(
            {
                type: 'read', mbean: scrMBean,
                arguments: []
            });

        //Check if the MBean provides the Components attribute.
        if (!('Components' in response.value)) {
            response = jolokia.request(
                {
                    type: 'exec', mbean: scrMBean, operation: 'listComponents()'
                });
            return createScrComponentsView(workspace, jolokia, response.value);
        }
        return response.value['Components'].values;
    }

    export function getComponentByName(workspace, jolokia, componentName) {
        var components = getAllComponents(workspace, jolokia)
        return components.find((c) => {
            return c.Name == componentName;
        });

    }

    export function isComponentActive(workspace, jolokia, component) {
        var response =  jolokia.request(
            {
                type: 'exec', mbean: getSelectionScrMBean(workspace),
                operation: 'isComponentActive(java.lang.String)',
                arguments: [component]
            });
        return response.value;
    }

    export function getComponentState(workspace, jolokia, component) {
        var response =  jolokia.request(
            {
                type: 'exec', mbean: getSelectionScrMBean(workspace),
                operation: 'componentState(java.lang.String)',
                arguments: [component]
            });
        return response.value;
    }

    export function activateComponent(workspace, jolokia, component, success, error) {
        jolokia.request(
            {
                type: 'exec', mbean: getSelectionScrMBean(workspace),
                operation: 'activateComponent(java.lang.String)',
                arguments: [component]
            },
            onSuccess(success, { error: error }));
    }

    export function deactivateComponent(workspace, jolokia, component, success, error) {
        jolokia.request(
            {
                type: 'exec', mbean: getSelectionScrMBean(workspace),
                operation: 'deactiveateComponent(java.lang.String)',
                arguments: [component]
            },
            onSuccess(success, { error: error }));
    }

  export function populateDependencies(attributes, dependencies, features) {
    angular.forEach(dependencies, (feature) => {
      angular.forEach(feature, (entry) => {
        var enhancedFeature = extractFeature(attributes, entry["Name"], entry["Version"]);
        enhancedFeature["id"] = entry["Name"] + "/" + entry["Version"];
        //enhancedFeature["repository"] = repo["Name"];
        features.push(enhancedFeature);
      });
    });
  }

  export function getSelectionFeaturesMBean(workspace:Workspace):string {
    if (workspace) {
      var featuresStuff = workspace.mbeanTypesToDomain["features"] || {};
      var karaf = featuresStuff["org.apache.karaf"] || {};
      var mbean = karaf.objectName;
      if (mbean) {
        return mbean;
      }
      // lets navigate to the tree item based on paths
      var folder = workspace.tree.navigate("org.apache.karaf", "features");
      if (!folder) {
        // sometimes the features mbean is inside the 'root' folder
        folder = workspace.tree.navigate("org.apache.karaf");
        if (folder) {
          var children = folder.children;
          folder = null;
          angular.forEach(children, (child) => {
            if (!folder) {
              folder = child.navigate("features");
            }
          });        
        }
      }
      if (folder) {
        var children = folder.children;
        if (children) {
          var node = children[0];
          if (node) {
            return node.objectName;
          }
        }
        return folder.objectName;
      }
    }
    return null;
  }

    export function getSelectionScrMBean(workspace:Workspace):string {
        if (workspace) {
            var scrStuff = workspace.mbeanTypesToDomain["scr"] || {};
            var karaf = scrStuff["org.apache.karaf"] || {};
            var mbean = karaf.objectName;
            if (mbean) {
                return mbean;
            }
            // lets navigate to the tree item based on paths
            var folder = workspace.tree.navigate("org.apache.karaf", "scr");
            if (!folder) {
                // sometimes the features mbean is inside the 'root' folder
                folder = workspace.tree.navigate("org.apache.karaf");
                if (folder) {
                  var children = folder.children;
                  folder = null;
                  angular.forEach(children, (child) => {
                      if (!folder) {
                          folder = child.navigate("scr");
                      }
                  });
                }
            }
            if (folder) {
                var children = folder.children;
                if (children) {
                    var node = children[0];
                    if (node) {
                        return node.objectName;
                    }
                }
                return folder.objectName;
            }
        }
        return null;
    }
}
