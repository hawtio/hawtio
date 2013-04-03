module Camel {

  /**
   * Looks up the route XML for the given context and selected route and
   * processes the selected route's XML with the given function
   */
  export function processRouteXml(workspace:Workspace, jolokia, folder, onRoute) {
    var selectedRouteId = getSelectedRouteId(workspace, folder);
    var mbean = getSelectionCamelContextMBean(workspace);

    function onRouteXml(response) {
      var route = null;
      var data = response ? response.value : null;
      if (data) {
        var doc = $.parseXML(data);
        console.log("Finding route for ID " + selectedRouteId);
        var routes = $(doc).find("route[id='" + selectedRouteId + "']");
        if (routes && routes.length) {
          route = routes[0];
        }
      }
      onRoute(route);
    }

    if (mbean && selectedRouteId) {
      jolokia.request(
              {type: 'exec', mbean: mbean, operation: 'dumpRoutesAsXml()'},
              onSuccess(onRouteXml, {error: onRouteXml}));
    } else {
      onRoute(null);
    }
  }

  /**
   * Adds the route children to the given folder for each step in the route
   */
  export function addRouteChildren(folder: Folder, route) {
    folder.children = [];
    $(route).children("*").each((idx, n) => {
      var nodeName = n.nodeName;
      if (nodeName) {
        var name = nodeName;
        if (nodeName === "from" || nodeName === "to") {
          var uri = n.getAttribute("uri");
          if (!uri) {
            var ref = n.getAttribute("ref");
            if (ref) {
              uri = "ref:" + ref;
            }
          }
          if (uri) {
            name += " " + uri;
          }
        }
        var child = new Folder(name);
        child.domain = jmxDomain;
        child.typeName = "routeNode";
        folder.children.push(child);
        addRouteChildren(child, n);
      }
    });
  }

  /**
   * Returns the selected camel context mbean for the given selection or null if it cannot be found
   */
    // TODO should be a service
  export function getSelectionCamelContextMBean(workspace:Workspace) {
    if (workspace) {
      var contextId = getContextId(workspace);
      var selection = workspace.selection;
      var tree = workspace.tree;
      if (tree && selection) {
        var domain = selection.domain;
        if (domain && contextId) {
          var result = tree.navigate(domain, contextId, "context");
          if (result && result.children) {
            var contextBean = result.children.first();
            if (contextBean.title) {
              var contextName = contextBean.title;
              return "" + domain + ":context=" + contextId + ',type=context,name="' + contextName + '"';
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Returns the selected camel trace mbean for the given selection or null if it cannot be found
   */
    // TODO Should be a service
  export function getSelectionCamelTraceMBean(workspace) {
    if (workspace) {
      var contextId = getContextId(workspace);
      var selection = workspace.selection;
      var tree = workspace.tree;
      if (tree && selection) {
        var domain = selection.domain;
        if (domain && contextId) {
          // look for the fuse camel fabric mbean
          var result = tree.navigate(domain, contextId, "fabric");
          if (result && result.children) {
            var mbean = result.children.first();
            return mbean.objectName;
          } else {
            // look for the Camel 2.11 mbean
            var result = tree.navigate(domain, contextId, "tracer");
            if (result && result.children) {
              var mbean = result.children.find(m => m.title.startsWith("Backlog"));
              if (mbean) {
                return mbean.objectName;
              }
            }
          }
        }
      }
    }
    return null;
  }

  // TODO should be a service
  export function getContextId(workspace:Workspace) {
    var selection = workspace.selection;
    if (selection) {
      var tree = workspace.tree;
      var folderNames = selection.folderNames;
      var entries = selection.entries;
      var contextId;
      if (tree) {
        if (folderNames && folderNames.length > 1) {
          contextId = folderNames[1];
        } else if (entries) {
          contextId = entries["context"];
        }
      }
    }
    return contextId;
  }

  /**
   * Returns true if the state of the item begins with the given state - or one of the given states
   *
   * @param item the item which has a State
   * @param state a value or an array of states
   */
  export function isState(item, state) {
    var value = (item.State || "").toLowerCase();
    if (angular.isArray(state)) {
      return state.any((stateText) => value.startsWith(stateText));
    } else {
      return value.startsWith(state);
    }
  }

  export function iconClass(state:string) {
    if (state) {
      switch (state.toLowerCase()) {
        case 'started':
          return "green icon-play";
        case 'suspended':
          return "icon-pause";
      }
    }
    return "red icon-stop";
  }

  export function getSelectedRouteId(workspace: Workspace, folder = null) {
    var selection = folder || workspace.selection;
    var selectedRouteId = null;
    if (selection) {
      if (selection && selection.entries) {
        var typeName = selection.entries["type"];
        var name = selection.entries["name"];
        if ("routes" === typeName && name) {
          selectedRouteId = trimQuotes(name);
        }
      }
    }
    return selectedRouteId;
  }
}