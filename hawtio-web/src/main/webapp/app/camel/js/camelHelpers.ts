/**
 * @module Camel
 */
module Camel {

  export var log:Logging.Logger = Logger.get("Camel");

  export var jmxDomain = 'org.apache.camel';

  export var defaultMaximumLabelWidth = 34;
  export var defaultCamelMaximumTraceOrDebugBodyLength = 5000;

  /**
   * Looks up the route XML for the given context and selected route and
   * processes the selected route's XML with the given function
   * @method processRouteXml
   * @param {Workspace} workspace
   * @param {Object} jolokia
   * @param {Folder} folder
   * @param {Function} onRoute
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
   * @method getRouteNodeUri
   * @param {Object} node
   * @return {String}
   */
  export function getRouteNodeUri(node) {
    var uri: string = null;
    if (node) {
      uri = node.getAttribute("uri");
      if (!uri) {
        var ref = node.getAttribute("ref");
        if (ref) {
          var method = node.getAttribute("method");
          if (method) {
            uri = ref + "." + method + "()";
          } else {
            uri = "ref:" + ref;
          }
        }
      }
    }
    return uri;
  }

  /**
   * Returns the JSON data for the camel folder; extracting it from the associated
   * routeXmlNode or using the previously extracted and/or edited JSON
   * @method getRouteFolderJSON
   * @param {Folder} folder
   * @param {Object} answer
   * @return {Object}
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

  export function increaseIndent(currentIndent:string, indentAmount = "  ") {
    return currentIndent + indentAmount;
  }

  export function setRouteNodeJSON(routeXmlNode, newData, indent) {
    if (routeXmlNode) {
      var childIndent = increaseIndent(indent);

      function doUpdate(value, key, append = false) {
        if (angular.isArray(value)) {
          // remove previous nodes
          $(routeXmlNode).children(key).remove();
          angular.forEach(value, (item) => {
            doUpdate(item, key, true);
          });
        } else if (angular.isObject(value)) {
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
          if (append || !nested || !nested.length) {
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
            if (key.startsWith("_")) {
              // ignore
            } else {
              var text = value.toString();
              routeXmlNode.setAttribute(key, text);
            }
          } else {
            routeXmlNode.removeAttribute(key);
          }
        }
      }

      angular.forEach(newData, (value, key) => doUpdate(value, key, false));
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
   * Parse out the currently selected endpoint's name to be used when invoking on a
   * context operation that wants an endpoint name
   * @method getSelectedEndpointName
   * @param {Workspace} workspace
   * @return {any} either a string that is the endpoint name or null if it couldn't be parsed
   */
  export function getSelectedEndpointName(workspace:Workspace) {
    var selection = workspace.selection;
    if (selection && selection['objectName'] && selection['typeName'] && selection['typeName'] === 'endpoints') {
      var mbean = Core.parseMBean(selection['objectName']);
      if (!mbean) {
        return null;
      }
      var attributes = mbean['attributes'];
      if (!attributes) {
        return null;
      }

      if (!('name' in attributes)) {
        return null;
      }

      var uri = attributes['name'];
      uri = uri.replace("\\?", "?");
      if (uri.startsWith("\"")) {
        uri = uri.last(uri.length - 1);
      }
      if (uri.endsWith("\"")) {
        uri = uri.first(uri.length - 1);
      }
      return uri;
    } else {
      return null;
    }
  }

  /**
   * Returns the mbean for the currently selected camel context and the name of the currently
   * selected endpoint for JMX operations on a context that require an endpoint name.
   * @method
   * @param workspace
   * @return {{uri: string, mbean: string}} either value could be null if there's a parse failure
   */
  export function getContextAndTargetEndpoint(workspace:Workspace) {
    return {
      uri: Camel.getSelectedEndpointName(workspace),
      mbean: Camel.getSelectionCamelContextMBean(workspace)
    };
  }

  /**
   * Returns the cached Camel XML route node stored in the current tree selection Folder
   * @method
   */
  export function getSelectedRouteNode(workspace:Workspace) {
    var selection = workspace.selection;
    return (selection && jmxDomain === selection.domain) ? selection["routeXmlNode"] : null;
  }

  /**
   * Flushes the cached Camel XML route node stored in the selected tree Folder
   * @method
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
   * @method
   */
  export function getCamelSchema(nodeIdOrDefinition) {
    return (angular.isObject(nodeIdOrDefinition)) ? nodeIdOrDefinition : Forms.lookupDefinition(nodeIdOrDefinition, _apacheCamelModel);
  }

  /**
   * Returns true if the given nodeId is a route, endpoint or pattern
   * (and not some nested type like a data format)
   * @method
   */
  export function isCamelPattern(nodeId) {
    return Forms.isJsonType(nodeId, _apacheCamelModel, "org.apache.camel.model.OptionalIdentifiedDefinition");
  }

  /**
   * Returns true if the given node type prefers adding the next sibling as a child
   * @method
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
   * @method
   */
  export function camelLanguageSettings(nodeName) {
    return _apacheCamelModel.languages[nodeName];
  }

  export function isCamelLanguage(nodeName) {
    return (camelLanguageSettings(nodeName) || nodeName === "expression") ? true : false;
  }

  /**
   * Converts the XML string or DOM node to a camel tree
   * @method
   */
  export function loadCamelTree(xml, key:string) {
    var doc = xml;
    if (angular.isString(xml)) {
      doc = $.parseXML(xml);
    }

    // TODO get id from camelContext
    var id = "camelContext";
    var folder = new Folder(id);
    folder.addClass = "org-apache-camel-context";
    folder.domain = Camel.jmxDomain;
    folder.typeName = "context";

    folder.key = Core.toSafeDomID(key);

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
        routeFolder.key = folder.key + "_" + Core.toSafeDomID(id);
        routeFolder.parent = folder;
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
   * @method
   */
  export function addRouteChildren(folder:Folder, route) {
    folder.children = [];
    folder["routeXmlNode"] = route;
    route.setAttribute("_cid", folder.key);
    $(route).children("*").each((idx, n) => {
      addRouteChild(folder, n);
    });
  }

  /**
   * Adds a child to the given folder / route
   * @method
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
        var key = folder.key + "_" + Core.toSafeDomID(id);

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

  /**
   * Returns the root JMX Folder of the camel mbeans
   */
  export function getRootCamelFolder(workspace) {
    var tree = workspace ? workspace.tree : null;
    if (tree) {
      return tree.get(jmxDomain);
    }
    return null;
  }

  /**
   * Returns the JMX folder for the camel context
   */
  export function getCamelContextFolder(workspace, camelContextId) {
    var answer = null;
    var root = getRootCamelFolder(workspace);
    if (root && camelContextId) {
        angular.forEach(root.children, (contextFolder) => {
          if (!answer && camelContextId === contextFolder.title) {
            answer = contextFolder;
          }
        });
    }
    return answer;
  }

  /**
   * Returns the mbean for the given camel context ID or null if it cannot be found
   */
  export function getCamelContextMBean(workspace, camelContextId) {
    var contextsFolder = getCamelContextFolder(workspace, camelContextId);
    if (contextsFolder) {
      var contextFolder = contextsFolder.navigate("context");
      if (contextFolder && contextFolder.children && contextFolder.children.length) {
        var contextItem = contextFolder.children[0];
        return contextItem.objectName;
      }
    }
    return null;
  }


  /**
   * Returns the link to browse the endpoint full screen
   */
  export function linkToBrowseEndpointFullScreen(contextId, endpointPath) {
    var answer: string = null;
    if (contextId && endpointPath) {
      answer = "#/camel/endpoint/browse/" + contextId + "/" + endpointPath;
    }
    return answer;
  }


  /**
   * Returns the link to the route diagram full screen
   */
  export function linkToRouteDiagramFullScreen(contextId, routeId) {
    var answer: string = null;
    if (contextId && routeId) {
      answer = "#/camel/route/diagram/" + contextId + "/" + routeId;
    }
    return answer;
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
   * @method
   * @param treeNode is either the Node from the tree widget (with the real Folder in the data property) or a Folder
   */
  export function createFolderXmlTree(treeNode, xmlNode, indent = Camel.increaseIndent("")) {
    var folder = treeNode.data || treeNode;
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
      angular.forEach(treeNode.children || treeNode.getChildren(), (childTreeNode) => {
        var childFolder = childTreeNode.data || childTreeNode;
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
        var split = uri.split("?");
        if (split && split.length > 1) {
          label = split[0];
        }
        tooltip += " " + uri;
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
   * @method
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

  export function getSelectionCamelContextEndpoints(workspace:Workspace) {
    if (workspace) {
      var contextId = getContextId(workspace);
      var selection = workspace.selection;
      var tree = workspace.tree;
      if (tree && selection) {
        var domain = selection.domain;
        if (domain && contextId) {
          return tree.navigate(domain, contextId, "endpoints");
        }
      }
    }
    return null;
  }

  /**
   * Returns the selected camel trace mbean for the given selection or null if it cannot be found
   * @method
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
            var mbean = result.children.find(m => m.title.startsWith("BacklogTracer"));
            if (mbean) {
              return mbean.objectName;
            }
          }
          // look for the fuse camel fabric mbean
          var fabricResult = tree.navigate(domain, contextId, "fabric");
          if (fabricResult && fabricResult.children) {
            var mbean = fabricResult.children.first();
            return mbean.objectName;
          }
        }
      }
    }
    return null;
  }

  export function getSelectionCamelDebugMBean(workspace) {
    if (workspace) {
      var contextId = getContextId(workspace);
      var selection = workspace.selection;
      var tree = workspace.tree;
      if (tree && selection) {
        var domain = selection.domain;
        if (domain && contextId) {
          var result = tree.navigate(domain, contextId, "tracer");
          if (result && result.children) {
            var mbean = result.children.find(m => m.title.startsWith("BacklogDebugger"));
            if (mbean) {
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
   * @method
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

  export function getSelectedRouteId(workspace:Workspace, folder = null) {
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
   * @method
   */
    // TODO Should be a service
  export function getSelectionRouteMBean(workspace:Workspace, routeId:String) {
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

  export function getCamelVersion(workspace:Workspace, jolokia) {
    var mbean = getSelectionCamelContextMBean(workspace);
    if (mbean) {
      // must use onSuccess(null) that means sync as we need the version asap
      return jolokia.getAttribute(mbean, "CamelVersion", onSuccess(null));
    } else {
      return null;
    }
  }

  export function createMessageFromXml(exchange) {
    var exchangeElement = $(exchange);
    var uid = exchangeElement.children("uid").text();
    var timestamp = exchangeElement.children("timestamp").text();
    var messageData = {
      headers: {},
      headerTypes: {},
      id: null,
      uid: uid,
      timestamp: timestamp,
      headerHtml: ""
    };
    var message = exchangeElement.children("message")[0];
    if (!message) {
      message = exchange;
    }
    var messageElement = $(message);
    var headers = messageElement.find("header");
    var headerHtml = "";
    headers.each((idx, header) => {
      var key = header.getAttribute("key");
      var typeName = header.getAttribute("type");
      var value = header.textContent;
      if (key) {
        if (value) messageData.headers[key] = value;
        if (typeName) messageData.headerTypes[key] = typeName;

        headerHtml += "<tr><td class='property-name'>" + key + "</td>" +
                "<td class='property-value'>" + (value || "") + "</td></tr>";
      }
    });

    messageData.headerHtml = headerHtml;
    var id = messageData.headers["breadcrumbId"];
    if (!id) {
      var postFixes = ["MessageID", "ID", "Path", "Name"];
      angular.forEach(postFixes, (postfix) => {
        if (!id) {
          angular.forEach(messageData.headers, (value, key) => {
            if (!id && key.endsWith(postfix)) {
              id = value;
            }
          });
        }
      });

      // lets find the first header with a name or Path in it
      // if still no value, lets use the first :)
      angular.forEach(messageData.headers, (value, key) => {
        if (!id) id = value;
      });
    }
    messageData.id = id;
    var body = messageElement.children("body")[0];
    if (body) {
      var bodyText = body.textContent;
      var bodyType = body.getAttribute("type");
      messageData["body"] = bodyText;
      messageData["bodyType"] = bodyType;
    }
    return messageData;
  }

  export function createBrowseGridOptions() {
    return {
       selectedItems: [],
       data: 'messages',
       displayFooter: false,
       showFilter: false,
       showColumnMenu: true,
       enableColumnResize: true,
       enableColumnReordering: true,
       filterOptions: {
         filterText: ''
       },
       selectWithCheckboxOnly: true,
       showSelectionCheckbox: true,
       maintainColumnRatios: false,
       columnDefs: [
         {
           field: 'id',
           displayName: 'ID',
           // for ng-grid
           //width: '50%',
           // for hawtio-datatable
           // width: "22em",
           cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.id}}</a></div>'
         }
       ]
     };
  }

  export function loadRouteXmlNodes($scope, doc, selectedRouteId, nodes, links, width) {
    var allRoutes = $(doc).find("route");
    var routeDelta = width / allRoutes.length;
    var rowX = 0;
    allRoutes.each((idx, route) => {
      var routeId = route.getAttribute("id");
      if (!selectedRouteId || !routeId || selectedRouteId === routeId) {
        Camel.addRouteXmlChildren($scope, route, nodes, links, null, rowX, 0);
        rowX += routeDelta;
      }
    });
  }

  export function addRouteXmlChildren($scope, parent, nodes, links, parentId, parentX, parentY, parentNode = null) {
    var delta = 150;
    var x = parentX;
    var y = parentY + delta;
    var rid = parent.getAttribute("id");
    var siblingNodes = [];
    var parenNodeName = parent.localName;
    $(parent).children().each((idx, route) => {
      var id = nodes.length;
      // from acts as a parent even though its a previous sibling :)
      var nodeId = route.localName;
      if (nodeId === "from" && !parentId) {
        parentId = id;
      }
      var nodeSettings = getCamelSchema(nodeId);
      var node = null;
      if (nodeSettings) {
        var label = nodeSettings["title"] || nodeId;
        var uri = getRouteNodeUri(route);
        if (uri) {
          label += " " + uri.split("?")[0];
        }
        var tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || label;
        if (uri) {
          tooltip += " " + uri;
        }
        var elementID = route.getAttribute("id");
        var labelSummary = label;
        if (elementID) {
          var customId = route.getAttribute("customId");
          if ($scope.camelIgnoreIdForLabel || (!customId || customId === "false")) {
            labelSummary = "id: " + elementID;
          } else {
            label = elementID;
          }
        }
        // lets check if we need to trim the label
        var labelLimit = $scope.camelMaximumLabelWidth || Camel.defaultMaximumLabelWidth;
        var length = label.length;
        if (length > labelLimit) {
          labelSummary = label + "\n\n" + labelSummary;
          label = label.substring(0, labelLimit) + "..";
        }

        var imageUrl = getRouteNodeIcon(nodeSettings);
        if ((nodeId === "from" || nodeId === "to") && uri) {
          var uriIdx = uri.indexOf(":");
          if (uriIdx > 0) {
            var componentScheme = uri.substring(0, uriIdx);
            //console.log("lets find the endpoint icon for " + componentScheme);
            if (componentScheme) {
              var value = Camel.getEndpointIcon(componentScheme);
              if (value) {
                imageUrl = url(value);
              }
            }
          }
        }

        //console.log("Image URL is " + imageUrl);
        var cid = route.getAttribute("_cid") || route.getAttribute("id");
        node = { "name": name, "label": label, "labelSummary": labelSummary, "group": 1, "id": id, "elementId": elementID,
          "x": x, "y:": y, "imageUrl": imageUrl, "cid": cid, "tooltip": tooltip, "type": nodeId};
        if (rid) {
          node["rid"] = rid;
          if (!$scope.routeNodes) $scope.routeNodes = {};
          $scope.routeNodes[rid] = node;
        }
        if (!cid) {
          cid = nodeId + (nodes.length + 1);
        }
        if (cid) {
          node["cid"] = cid;
          if (!$scope.nodes) $scope.nodes = {};
          $scope.nodes[cid] = node;
        }
        // only use the route id on the first from node
        rid = null;
        nodes.push(node);
        if (parentId !== null && parentId !== id) {
          if (siblingNodes.length === 0 || parenNodeName === "choice") {
            links.push({"source": parentId, "target": id, "value": 1});
          } else {
            siblingNodes.forEach(function (nodeId) {
              links.push({"source": nodeId, "target": id, "value": 1});
            });
            siblingNodes.length = 0;
          }
        }
      } else {
        // ignore non EIP nodes, though we should add expressions...
        var langSettings =  Camel.camelLanguageSettings(nodeId);
        if (langSettings && parentNode) {
          // lets add the language kind
          var name = langSettings["name"] || nodeId;
          var text = route.textContent;
          if (text) {
            parentNode["tooltip"] = parentNode["label"] + " " + name + " " + text;
            parentNode["label"] = text;
          } else {
            parentNode["label"] = parentNode["label"] + " " + name;
          }
        }
      }
      var siblings = addRouteXmlChildren($scope, route, nodes, links, id, x, y, node);
      if (parenNodeName === "choice") {
        siblingNodes = siblingNodes.concat(siblings);
        x += delta;
      } else if (nodeId === "choice") {
        siblingNodes = siblings;
        y += delta;
      } else {
        siblingNodes = [nodes.length - 1];
        y += delta;
      }
    });
    return siblingNodes;
  }

  export function getCanvasHeight(canvasDiv) {
    var height = canvasDiv.height();
    if (height < 300) {
      console.log("browse thinks the height is only " + height + " so calculating offset from doc height");
      var offset = canvasDiv.offset();
      height = $(document).height() - 5;
      if (offset) {
        var top = offset['top'];
        if (top) {
          height -= top;
        }
      }
    }
    return height;
  }

  /**
   * Recursively add all the folders which have a cid value into the given map
   * @method
   */
  export function addFoldersToIndex(folder:Folder, map = {}) {
    if (folder) {
      var key = folder.key
      if (key) {
        map[key] = folder;
      }
      angular.forEach(folder.children, (child) => addFoldersToIndex(child, map));
    }
    return map;
  }



  /**
   * Re-generates the XML document using the given Tree widget Node or Folder as the source
   * @method
   */
  export function generateXmlFromFolder(treeNode) {
    var folder = (treeNode && treeNode.data) ? treeNode.data : treeNode;
    if (!folder) return null;
    var doc = folder["xmlDocument"];
    var context = folder["routeXmlNode"];

    if (context && context.length) {
      var element = context[0];
      var children = element.childNodes;
      var routeIndices = [];
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        var name = node.localName;
        if ("route" === name && parent) {
          routeIndices.push(i);
        }
      }

      // lets go backwards removing all the text nodes on either side of each route along with the route
      while (routeIndices.length) {
        var idx = routeIndices.pop();
        var nextIndex = idx + 1;
        while (true) {
          var node = element.childNodes[nextIndex];
          if (Core.isTextNode(node)) {
            element.removeChild(node);
          } else {
            break;
          }
        }
        if (idx < element.childNodes.length) {
          element.removeChild(element.childNodes[idx]);
        }
        for (var i = idx - 1; i >= 0; i--) {
          var node = element.childNodes[i];
          if (Core.isTextNode(node)) {
            element.removeChild(node);
          } else {
            break;
          }
        }
      }
      Camel.createFolderXmlTree(treeNode, context[0]);
    }
    return doc;
  }

  /**
   * Returns an object of all the CamelContext MBeans keyed by their id
   * @method
   */
  export function camelContextMBeansById(workspace:Workspace) {
    var answer = {};
    var tree = workspace.tree;
    if (tree) {
      var camelTree = tree.navigate(Camel.jmxDomain);
      if (camelTree) {
        angular.forEach(camelTree.children, (contextsFolder) => {
          var contextFolder = contextsFolder.navigate("context");
          if (contextFolder && contextFolder.children && contextFolder.children.length) {
            var contextItem = contextFolder.children[0];
            var id = Core.pathGet(contextItem, ["entries", "name"]) || contextItem.key;
            if (id) {
              answer[id] = {
                folder: contextItem,
                mbean: contextItem.objectName
              }
            }
          }
        });
      }
    }
    return answer;
  }


  /**
   * Returns an object of all the CamelContext MBeans keyed by the component name
   * @method
   */
  export function camelContextMBeansByComponentName(workspace:Workspace) {
    return camelContextMBeansByRouteOrComponentId(workspace, "components")
  }

  /**
   * Returns an object of all the CamelContext MBeans keyed by the route ID
   * @method
   */
  export function camelContextMBeansByRouteId(workspace:Workspace) {
    return camelContextMBeansByRouteOrComponentId(workspace, "routes")
  }

  function camelContextMBeansByRouteOrComponentId(workspace:Workspace, componentsOrRoutes: string) {
    var answer = {};
    var tree = workspace.tree;
    if (tree) {
      var camelTree = tree.navigate(Camel.jmxDomain);
      if (camelTree) {
        angular.forEach(camelTree.children, (contextsFolder) => {
          var contextFolder = contextsFolder.navigate("context");
          var componentsFolder = contextsFolder.navigate(componentsOrRoutes);
          if (contextFolder && componentsFolder && contextFolder.children && contextFolder.children.length) {
            var contextItem = contextFolder.children[0];
            var mbean = contextItem.objectName;
            if (mbean) {
              var contextValues = {
                folder: contextItem,
                mbean: mbean
              };
              angular.forEach(componentsFolder.children, (componentFolder) => {
                var id = componentFolder.title;
                if (id) {
                  answer[id] = contextValues;
                }
              });
            }
          }
        });
      }
    }
    return answer;
  }


  /**
   * Returns true if we should ignore ID values for labels in camel diagrams
   * @method
   */
  export function ignoreIdForLabel(localStorage) {
    var value = localStorage["camelIgnoreIdForLabel"];
    return value && (value === "true" || value === true);
  }

  /**
   * Returns the maximum width of a label before we start to truncate
   * @method
   */
  export function maximumLabelWidth(localStorage) {
    var value = localStorage["camelMaximumLabelWidth"];
    if (angular.isString(value)) {
      value = parseInt(value);
    }
    if (!value) {
      value = Camel.defaultMaximumLabelWidth;
    }
    return value;
  }

  /**
   * Returns the max body length for tracer and debugger
   * @method
   */
  export function maximumTraceOrDebugBodyLength(localStorage) {
    var value = localStorage["camelMaximumTraceOrDebugBodyLength"];
    if (angular.isString(value)) {
      value = parseInt(value);
    }
    if (!value) {
      value = Camel.defaultCamelMaximumTraceOrDebugBodyLength;
    }
    return value;
  }

  /**
   * Function to highlight the selected toNode in the nodes graph
   *
   * @param nodes the nodes
   * @param toNode the node to highlight
   */
  export function highlightSelectedNode(nodes, toNode) {
    // lets clear the selected node first
    nodes.attr("class", "node");

    nodes.filter(function (item) {
      if (item) {
        var cid = item["cid"];
        var rid = item["rid"];
        var type = item["type"];
        var elementId = item["elementId"];

        // if its from then match on rid
        if ("from" === type) {
          return toNode === rid;
        }

        // okay favor using element id as the cids can become
        // undefined or mangled with mbean object names, causing this to not work
        // where as elementId when present works fine
        if (elementId) {
          // we should match elementId if defined
          return toNode === elementId;
        }
        // then fallback to cid
        if (cid) {
          return toNode === cid;
        } else {
          // and last rid
          return toNode === rid;
        }
      }
      return null;
    }).attr("class", "node selected");
  }

}
