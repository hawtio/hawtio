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

  export function installRepository(workspace, jolokia, uri, success, error) {
    log.info("installing URI: ", uri);
    jolokia.request({
      type: 'exec', mbean: getSelectionFeaturesMBean(workspace),
      operation: 'addRepository(java.lang.String)',
      arguments: [uri]
    }, onSuccess(success, { error: error }));
  }

  export function uninstallRepository(workspace, jolokia, uri, success, error) {
    log.info("uninstalling URI: ", uri);
    jolokia.request({
      type: 'exec', mbean: getSelectionFeaturesMBean(workspace),
      operation: 'removeRepository(java.lang.String)',
      arguments: [uri]
    }, onSuccess(success, { error: error }));
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
    return  "<a href='" + Core.url("#/karaf/feature/" + name + "/" + version + workspace.hash()) + "'>" + version + "</a>";
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

  var platformBundlePatterns = [
    "^org.apache.aries",
    "^org.apache.karaf",
    "^activemq-karaf",
    "^org.apache.commons",
    "^org.apache.felix",
    "^io.fabric8",
    "^io.fabric8.fab",
    "^io.fabric8.insight",
    "^io.fabric8.mq",
    "^io.fabric8.patch",
    "^io.fabric8.runtime",
    "^io.fabric8.security",
    "^org.apache.geronimo.specs",
    "^org.apache.servicemix.bundles",
    "^org.objectweb.asm",
    "^io.hawt",
    "^javax.mail",
    "^javax",
    "^org.jvnet",
    "^org.mvel2",
    "^org.apache.mina.core",
    "^org.apache.sshd.core",
    "^org.apache.neethi",
    "^org.apache.servicemix.specs",
    "^org.apache.xbean",
    "^org.apache.santuario.xmlsec",
    "^biz.aQute.bndlib",
    "^groovy-all",
    "^com.google.guava",
    "jackson-\\w+-asl",
    "^com.fasterxml.jackson",
    "^org.ops4j",
    "^org.springframework",
    "^bcprov$",
    "^jline$",
    "scala-library$",
    "^org.scala-lang",
    "^stax2-api$",
    "^woodstox-core-asl",
    "^org.jboss.amq.mq-fabric",
    "^gravia-",
    "^joda-time$",
    "^org.apache.ws",
    "-commands$",
    "patch.patch",
    "org.fusesource.insight",
    "activeio-core",
    "activemq-osgi",
    "^org.eclipse.jetty",
    "org.codehaus.jettison.jettison"
  ];

  var platformBundleRegex = new RegExp(platformBundlePatterns.join('|'));

  var camelBundlePatterns = ["^org.apache.camel", "camel-karaf-commands$", "activemq-camel$"];
  var camelBundleRegex = new RegExp(camelBundlePatterns.join('|'));

  var cxfBundlePatterns = ["^org.apache.cxf"];
  var cxfBundleRegex = new RegExp(cxfBundlePatterns.join('|'));

  var activemqBundlePatterns = ["^org.apache.activemq", "activemq-camel$"];
  var activemqBundleRegex = new RegExp(activemqBundlePatterns.join('|'));

  export function isPlatformBundle(symbolicName:string):boolean {
    return platformBundleRegex.test(symbolicName);
  }

  export function isActiveMQBundle(symbolicName:string):boolean {
    return activemqBundleRegex.test(symbolicName);
  }

  export function isCamelBundle(symbolicName:string):boolean {
    return camelBundleRegex.test(symbolicName);
  }

  export function isCxfBundle(symbolicName:string):boolean {
    return cxfBundleRegex.test(symbolicName);
  }

  export function populateFeaturesAndRepos(attributes, features, repositories) {
    var fullFeatures = attributes["Features"];
    angular.forEach(attributes["Repositories"], (repo) => {

      repositories.push({
        id: repo["Name"],
        uri: repo["Uri"]
      });

      if (!fullFeatures) {
        return;
      }

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
