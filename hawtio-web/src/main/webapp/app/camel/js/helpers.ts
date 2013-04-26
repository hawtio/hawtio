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
      if (!selectedRouteId) {
        console.log("No selectedRouteId when trying to lazy load the route!")
      }
      onRoute(null);
    }
  }

  /**
   * Returns the URI string for the given EIP pattern node or null if it is not applicable
   */
  export function getRouteNodeUri(node) {
    var uri = null;
    if (node) {
      uri = node.getAttribute("uri");
      if (!uri) {
        var ref = node.getAttribute("ref");
        if (ref) {
          uri = "ref:" + ref;
        }
      }
    }
    return uri;
  }

  /**
   * Returns the JSON data for the camel folder; extracting it from the associated
   * routeXmlNode or using the previously extracted and/or editted JSON
   */
  export function getRouteFolderJSON(folder, answer = {}) {
    var nodeData = folder["camelNodeData"];
    if (!nodeData) {
      var routeXmlNode = folder["routeXmlNode"];
      if (routeXmlNode) {
        nodeData = Camel.getRouteNodeJSON(routeXmlNode);
      }
      if (!nodeData) {
        nodeData = answer;
      }
      folder["camelNodeData"] = nodeData;
    }
    return nodeData;
  }

  export function getRouteNodeJSON(routeXmlNode, answer = {}) {
    if (routeXmlNode) {
      angular.forEach(routeXmlNode.attributes, (attr) => {
        answer[attr.name] = attr.value;
      });

      // lets not iterate into routes or top level tags
      var localName = routeXmlNode.localName;
      if (localName !== "route" && localName !== "routes" && localName !== "camelContext") {
        // lets look for nested elements and convert those
        // explicitly looking for expressions
        $(routeXmlNode).children("*").each((idx, element) => {
          var nodeName = element.localName;
          var langSettings = Camel.camelLanguageSettings(nodeName);
          if (langSettings) {
            // TODO the expression key could be anything really; how should we know?
            answer["expression"] = {
              language: nodeName,
              expression: element.textContent
            };
          } else {
            if (!isCamelPattern(nodeName)) {
              var nested = getRouteNodeJSON(element);
              if (nested) {
                answer[nodeName] = nested;
              }
            }
          }
        });
      }
    }
    return answer;
  }

  export function increaseIndent(currentIndent: string, indentAmount = "  ") {
    return currentIndent + indentAmount;
  }

  export function setRouteNodeJSON(routeXmlNode, newData, indent) {
    if (routeXmlNode) {
      var childIndent = increaseIndent(indent);
      angular.forEach(newData, (value, key) => {
        if (angular.isObject(value)) {
          // convert languages to the right xml
          var textContent = null;
          if (key === "expression") {
            var languageName = value["language"];
            if (languageName) {
              key = languageName;
              textContent = value["expression"];
              value = angular.copy(value);
              delete value["expression"];
              delete value["language"];
            }
          }
          // TODO deal with nested objects...
          var nested = $(routeXmlNode).children(key);
          var element = null;
          if (!nested || !nested.length) {
            var doc = routeXmlNode.ownerDocument || document;
            routeXmlNode.appendChild(doc.createTextNode("\n" + childIndent));
            element = doc.createElement(key);
            if (textContent) {
              element.appendChild(doc.createTextNode(textContent));
            }
            routeXmlNode.appendChild(element);
          } else {
            element = nested[0];
          }
          setRouteNodeJSON(element, value, childIndent);
          if (textContent) {
            nested.text(textContent);
          }
        } else {
          if (value) {
            var text = value.toString();
            routeXmlNode.setAttribute(key, text);
          } else {
            routeXmlNode.removeAttribute(key);
          }
        }
      });
    }
  }

  export function getRouteNodeIcon(nodeSettingsOrXmlNode) {
    var nodeSettings = null;
    if (nodeSettingsOrXmlNode) {
      var nodeName = nodeSettingsOrXmlNode.localName;
      if (nodeName) {
        nodeSettings = getCamelSchema(nodeName);
      } else {
        nodeSettings = nodeSettingsOrXmlNode;
      }
    }
    if (nodeSettings) {
      var imageName = nodeSettings["icon"] || "generic24.png";
      return url("/app/camel/img/" + imageName);
    } else {
      return null;
    }
  }

  /**
   * Returns the cached Camel XML route node stored in the current tree selection Folder
   */
  export function getSelectedRouteNode(workspace:Workspace) {
    var selection = workspace.selection;
    return (selection && jmxDomain === selection.domain) ? selection["routeXmlNode"] : null;
  }

  /**
   * Flushes the cached Camel XML route node stored in the selected tree Folder
   * @param workspace
   */
  export function clearSelectedRouteNode(workspace:Workspace) {
    var selection = workspace.selection;
    if (selection && jmxDomain === selection.domain) {
      delete selection["routeXmlNode"];
    }
  }

  /**
   * Looks up the given node name in the Camel schema
   */
  export function getCamelSchema(nodeIdOrDefinition) {
    return (angular.isObject(nodeIdOrDefinition)) ? nodeIdOrDefinition : Forms.lookupDefinition(nodeIdOrDefinition, _apacheCamelModel);
  }

  /**
   * Returns true if the given nodeId is a route, endpoint or pattern
   * (and not some nested type like a data format)
   */
  export function isCamelPattern(nodeId) {
    return Forms.isJsonType(nodeId, _apacheCamelModel, "org.apache.camel.model.OptionalIdentifiedDefinition");
  }

  /**
   * Returns true if the given node type prefers adding the next sibling as a child
   */
  export function isNextSiblingAddedAsChild(nodeIdOrDefinition) {
    var definition = getCamelSchema(nodeIdOrDefinition);
    if (definition) {
      return definition["nextSiblingAddedAsChild"] || false
    }
    return null;
  }

  export function acceptInput(nodeIdOrDefinition) {
    var definition = getCamelSchema(nodeIdOrDefinition);
    if (definition) {
      return definition["acceptInput"] || false
    }
    return null;
  }

  export function acceptOutput(nodeIdOrDefinition) {
    var definition = getCamelSchema(nodeIdOrDefinition);
    if (definition) {
      return definition["acceptOutput"] || false
    }
    return null;
  }

  /**
   * Looks up the Camel language settings for the given language name
   */
  export function camelLanguageSettings(nodeName) {
    return _apacheCamelModel.languages[nodeName];
  }

  export function isCamelLanguage(nodeName) {
    return (camelLanguageSettings(nodeName) || nodeName === "expression") ? true : false;
  }

  export function loadCamelTree(xml: string, key: string) {
    var doc = $.parseXML(xml);

    // TODO get id from camelContext
    var id = "camelContext";
    var folder = new Folder(id);
    folder.addClass = "org-apache-camel-context";
    folder.domain = Camel.jmxDomain;
    folder.typeName = "context";
    folder.key = key;

    var context = $(doc).find("camelContext");
    if (!context || !context.length) {
      context = $(doc).find("routes");
    }

    if (context && context.length) {
      folder["xmlDocument"] = doc;
      folder["routeXmlNode"] = context;
      $(context).children("route").each((idx, route) => {
        var id = route.getAttribute("id");
        if (!id) {
          id = "route" + idx;
          route.setAttribute("id", id);
        }
        var routeFolder = new Folder(id);
        routeFolder.addClass = "org-apache-camel-route";
        routeFolder.typeName = "routes";
        routeFolder.domain = Camel.jmxDomain;
        routeFolder.key = folder.key + "_" + id;
        var nodeSettings = getCamelSchema("route");
        if (nodeSettings) {
          var imageUrl = getRouteNodeIcon(nodeSettings);
          routeFolder.tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || id;
          routeFolder.icon = imageUrl;
        }
        folder.children.push(routeFolder);

        addRouteChildren(routeFolder, route);
      });
    }
    return folder;
  }

  /**
   * Adds the route children to the given folder for each step in the route
   */
  export function addRouteChildren(folder: Folder, route) {
    folder.children = [];
    folder["routeXmlNode"] = route;
    $(route).children("*").each((idx, n) => {
      addRouteChild(folder, n);
    });
  }

  /**
   * Adds a child to the given folder / route
   */
  export function addRouteChild(folder, n) {
    var nodeName = n.localName;
    if (nodeName) {
      var nodeSettings = getCamelSchema(nodeName);
      if (nodeSettings) {
        var imageUrl = getRouteNodeIcon(nodeSettings);

        var child = new Folder(nodeName);
        child.domain = jmxDomain;
        child.typeName = "routeNode";
        updateRouteNodeLabelAndTooltip(child, n, nodeSettings);

        // TODO should maybe auto-generate these?
        child.parent = folder;
        child.folderNames = folder.folderNames;
        var id = n.getAttribute("id") || nodeName;
        var key = folder.key + "." + id;

        // lets find the next key thats unique
        var counter = 1;
        var notFound = true;
        while (notFound) {
          var tmpKey = key + counter;
          if (folder.children.some({key: tmpKey})) {
            counter += 1;
          } else {
            notFound = false;
            key = tmpKey;
          }
        }
        child.key = key;
        child.icon = imageUrl;
        child["routeXmlNode"] = n;
        if (!folder.children) {
          folder.children = [];
        }
        folder.children.push(child);
        addRouteChildren(child, n);
        return child;
      }
    }
    return null;
  }

  export function getFolderCamelNodeId(folder) {
    var answer = Core.pathGet(folder, ["routeXmlNode", "localName"]);
    return ("from" === answer || "to" === answer) ? "endpoint" : answer;
  }

  /**
   * Rebuilds the DOM tree from the tree node and performs all the various hacks
   * to turn the folder / JSON / model into valid camel XML
   * such as renaming language elements from <language expression="foo" language="bar/>
   * to <bar>foo</bar>
   * and changing <endpoint> into either <from> or <to>
   */
  export function createFolderXmlTree(treeNode, xmlNode, indent = Camel.increaseIndent("")) {
    var folder = treeNode.data;
    var count = 0;
    var parentName = getFolderCamelNodeId(folder);
    if (folder) {
      if (!xmlNode) {
        xmlNode = document.createElement(parentName);
        var rootJson = Camel.getRouteFolderJSON(folder);
        if (rootJson) {
          Camel.setRouteNodeJSON(xmlNode, rootJson, indent);
        }
      }
      var doc = xmlNode.ownerDocument || document;
      var namespaceURI = xmlNode.namespaceURI;

      var from = parentName !== "route";
      var childIndent = Camel.increaseIndent(indent);
      angular.forEach(treeNode.getChildren(), (childTreeNode) => {
        var childFolder = childTreeNode.data;
        var name = Camel.getFolderCamelNodeId(childFolder);
        var json = Camel.getRouteFolderJSON(childFolder);
        if (name && json) {
          var language = false;
          if (name === "endpoint") {
            if (from) {
              name = "to";
            } else {
              name = "from";
              from = true;
            }
          }
          if (name === "expression") {
            var languageName = json["language"];
            if (languageName) {
              name = languageName;
              language = true;
            }
          }

          // lets create the XML
          xmlNode.appendChild(doc.createTextNode("\n" + childIndent));
          var newNode = doc.createElementNS(namespaceURI, name);

          Camel.setRouteNodeJSON(newNode, json, childIndent);
          xmlNode.appendChild(newNode);
          count += 1;
          createFolderXmlTree(childTreeNode, newNode, childIndent);
        }
      });
      if (count) {
        xmlNode.appendChild(doc.createTextNode("\n" + indent));
      }
    }
    return xmlNode;
  }


  export function updateRouteNodeLabelAndTooltip(folder, routeXmlNode, nodeSettings) {
    var localName = routeXmlNode.localName;
    var id = routeXmlNode.getAttribute("id");
    var label = nodeSettings["title"] || localName;

    // lets use the ID for routes and other things we give an id
    var tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || label;
    if (id) {
      label = id;
    } else {
      var uri = getRouteNodeUri(routeXmlNode);
      if (uri) {
        // Don't use from/to as it gets odd if you drag/drop and reorder
        // label += " " + uri;
        label = uri;
      } else {
        var children = $(routeXmlNode).children("*");
        if (children && children.length) {
          var child = children[0];
          var childName = child.localName;
          var expression = null;
          if (Camel.isCamelLanguage(childName)) {
            expression = child.textContent;
            if (!expression) {
              expression = child.getAttribute("expression");
            }
          }
          if (expression) {
            label += " " + expression;
            tooltip += " " + childName + " expression";
          }
        }
      }
    }
    folder.title = label;
    folder.tooltip = tooltip;
    return label;
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
          // look for the Camel 2.11 mbean which we prefer
          var result = tree.navigate(domain, contextId, "tracer");
          if (result && result.children) {
            var mbean = result.children.find(m => m.title.startsWith("Backlog"));
            if (mbean) {
              return mbean.objectName;
            }
            // lets try the first child then
            mbean = result.children.first();
            return mbean.objectName;
          } else {
            // look for the fuse camel fabric mbean
            var result = tree.navigate(domain, contextId, "fabric");
            if (result && result.children) {
              var mbean = result.children.first();
              return mbean.objectName;
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
          return "green icon-play-circle";
        case 'suspended':
          return "icon-pause";
      }
    }
    return "orange icon-off";
  }

  export function lastExchangeCompletedSince(entity) {
    var answer = null;
    if (entity) {
      answer = entity.lastExchangeCompletedSince;
      if (!answer) {
        answer = sinceFromTimestamp(entity["LastExchangeCompletedTimestamp"]);
        if (answer) {
          entity.lastExchangeCompletedSince = answer;
        }
      }
    }
    return answer;
  }

  export function sinceFromTimestamp(timestamp: number) {
    if (!timestamp) {
      return null;
    }

    // convert from timestamp to delta since now
    // 2013-04-26T145:01:17+0200
    var time = new Date(timestamp);
    var now = new Date();
    var diff = now.getTime() - time.getTime();
    return diff;
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

  /**
   * Returns the selected camel route mbean for the given route id
   */
    // TODO Should be a service
  export function getSelectionRouteMBean(workspace: Workspace, routeId: String) {
    if (workspace) {
      var contextId = getContextId(workspace);
      var selection = workspace.selection;
      var tree = workspace.tree;
      if (tree && selection) {
        var domain = selection.domain;
        if (domain && contextId) {
          var result = tree.navigate(domain, contextId, "routes");
          if (result && result.children) {
            var mbean = result.children.find(m => m.title === routeId);
            if (mbean) {
              return mbean.objectName;
            }
          }
        }
      }
    }
    return null;
  }

  export function getCamelVersion(workspace: Workspace, jolokia) {
    var mbean = getSelectionCamelContextMBean(workspace);
    if (mbean) {
      // must use onSuccess(null) that means sync as we need the version asap
      return jolokia.getAttribute(mbean, "CamelVersion", onSuccess(null));
    } else {
      return null;
    }
  }


}