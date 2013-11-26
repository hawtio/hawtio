/**
 * @module Dozer
 */
module Dozer {

  export var jmxDomain = 'net.sourceforge.dozer';

  /**
   * Don't try and load properties for these types
   * @property
   * @for Dozer
   * @type {Array}
   */
  export var excludedPackages = [
    'java.lang',
    'int',
    'double',
    'long'
  ];

  /**
   * Lets map the class names to element names
   * @property
   * @for Dozer
   * @type {Array}
   */
  export var elementNameMappings = {
    "Mapping": "mapping",
    "MappingClass": "class",
    "Field": "field"
  };

  export var log:Logging.Logger = Logger.get("Dozer");


  /**
   * Converts the XML string or DOM node to a Dozer model
   * @method loadDozerModel
   * @param {Object} xml
   * @param {String} pageId
   * @return {Mappings}
   */
  export function loadDozerModel(xml, pageId: string): Mappings {
    var doc = xml;
    if (angular.isString(xml)) {
      doc = $.parseXML(xml);
    }
    console.log("Has Dozer XML document: " + doc);

    var model = new Mappings(doc);
    var mappingsElement = doc.documentElement;
    copyAttributes(model, mappingsElement);

    $(mappingsElement).children("mapping").each( (idx, element) => {
      var mapping = createMapping(element);
      model.mappings.push(mapping);
    });

    return model;
  }

  export function saveToXmlText(model: Mappings): string {
    // lets copy the original doc then replace the mapping elements
    var element = model.doc.documentElement.cloneNode(false);
    appendElement(model.mappings, element, null, 1);
    Dozer.addTextNode(element, "\n");
    var xmlText = Core.xmlNodeToString(element);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlText;
  }

  export function findUnmappedFields(workspace: Workspace, mapping: Mapping, fn) {
    // lets find the fields which are unmapped
    var className = mapping.class_a.value;
    findProperties(workspace, className, null, (properties) => {
      var answer = [];
      angular.forEach(properties, (property) => {
        console.log("got property " + JSON.stringify(property, null, "  "));
        var name = property.name;
        if (name) {
          if (mapping.hasFromField(name)) {
            // ignore this one
          } else {
            // TODO auto-detect this property name in the to classes?
            answer.push(new UnmappedField(name, property));
          }
        }
      });
      fn(answer);
    })
  }

  /**
   * Finds the properties on the given class and returns them; and either invokes the given function
   * or does a sync request and returns them
   * @method findProperties
   * @param {Workspace} workspace
   * @param {String} className
   * @param {String} filter
   * @param {Function} fn
   * @return {any}
   */
  export function findProperties(workspace: Workspace, className: string, filter: string = null, fn = null) {
    var mbean = getIntrospectorMBean(workspace);
    if (mbean) {
      if (filter) {
        return workspace.jolokia.execute(mbean, "findProperties", className, filter, onSuccess(fn));
      } else {
        return workspace.jolokia.execute(mbean, "getProperties", className, onSuccess(fn));
      }
    } else {
      if (fn) {
        return fn([]);
      } else {
        return [];
      }
    }
  }

  /**
   * Finds class names matching the given search text and either invokes the function with the results
   * or does a sync request and returns them.
   * @method findClassNames
   * @param {Workspace} workspace
   * @param {String} searchText
   * @param {Number} limit @default 20
   * @param {Function} fn
   * @return {any}
   */
  export function findClassNames(workspace: Workspace, searchText: string, limit = 20, fn = null) {
    var mbean = getIntrospectorMBean(workspace);
    if (mbean) {
      return workspace.jolokia.execute(mbean, "findClassNames", searchText, limit, onSuccess(fn));
    } else {
      if (fn) {
        return fn([]);
      } else {
        return [];
      }
    }
  }


  export function getIntrospectorMBean(workspace: Workspace) {
    return Core.getMBeanTypeObjectName(workspace, "io.hawt.introspect", "Introspector");
  }

  export function loadModelFromTree(rootTreeNode, oldModel: Mappings): Mappings {
    oldModel.mappings = [];
    angular.forEach(rootTreeNode.childList, (treeNode) => {
      var mapping = Core.pathGet(treeNode, ["data", "entity"]);
      if (mapping) {
        oldModel.mappings.push(mapping);
      }
    });
    return oldModel;
  }

  export function createDozerTree(model: Mappings): Folder {
    var id = "mappings";
    var folder = new Folder(id);
    folder.addClass = "net-sourceforge-dozer-mappings";
    folder.domain = Dozer.jmxDomain;
    folder.typeName = "mappings";
    folder.entity = model;

    folder.key = Core.toSafeDomID(id);

    angular.forEach(model.mappings, (mapping) => {
      var mappingFolder = createMappingFolder(mapping, folder);
      folder.children.push(mappingFolder);
    });
    return folder;
  }

  export function createMappingFolder(mapping, parentFolder) {
    var mappingName = mapping.name();
    var mappingFolder = new Folder(mappingName);
    mappingFolder.addClass = "net-sourceforge-dozer-mapping";
    mappingFolder.typeName = "mapping";
    mappingFolder.domain = Dozer.jmxDomain;
    mappingFolder.key = (parentFolder ? parentFolder.key + "_" : "") + Core.toSafeDomID(mappingName);
    mappingFolder.parent = parentFolder;
    mappingFolder.entity = mapping;
    mappingFolder.icon = url("/app/dozer/img/class.gif");
    /*
          mappingFolder.tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || id;
          */
    angular.forEach(mapping.fields, (field) => {
      addMappingFieldFolder(field, mappingFolder);
    });
    return mappingFolder;
  }

  export function addMappingFieldFolder(field, mappingFolder) {
    var name = field.name();
    var fieldFolder = new Folder(name);
    fieldFolder.addClass = "net-sourceforge-dozer-field";
    fieldFolder.typeName = "field";
    fieldFolder.domain = Dozer.jmxDomain;
    fieldFolder.key = mappingFolder.key + "_" + Core.toSafeDomID(name);
    fieldFolder.parent = mappingFolder;
    fieldFolder.entity = field;
    fieldFolder.icon = url("/app/dozer/img/attribute.gif");
    /*
          fieldFolder.tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || id;
          */

    mappingFolder.children.push(fieldFolder);
    return fieldFolder;
  }

  function createMapping(element) {
    var mapping = new Mapping();
    var elementJQ = $(element);
    mapping.class_a = createMappingClass(elementJQ.children("class-a"));
    mapping.class_b = createMappingClass(elementJQ.children("class-b"));
    elementJQ.children("field").each( (idx, fieldElement) => {
      var field = createField(fieldElement);
      mapping.fields.push(field);
    });
    copyAttributes(mapping, element);
    return mapping;
  }

  function createField(element) {
    if (element) {
      var jqe = $(element);
      var a = jqe.children("a").text();
      var b = jqe.children("b").text();
      var field = new Field(new FieldDefinition(a), new FieldDefinition(b));
      copyAttributes(field, element);
      return field;
    }
    return new Field(new FieldDefinition(""), new FieldDefinition(""));
  }

  function createMappingClass(jqElement) {
    if (jqElement && jqElement[0]) {
      var element = jqElement[0];
      var text = element.textContent;
      if (text) {
        var mappingClass = new MappingClass(text);
        copyAttributes(mappingClass, element);
        return mappingClass;
      }
    }
    // lets create a default empty mapping
    return new MappingClass("");
  }

  function copyAttributes(object: any, element: Element) {
    var attributeMap = element.attributes;
    for (var i = 0; i < attributeMap.length; i++) {
      // TODO hacky work around for compiler issue ;)
      //var attr = attributeMap.item(i);
      var attMap: any = attributeMap;
      var attr = attMap.item(i);
      if (attr) {
        var name = attr.localName;
        var value = attr.value;
        if (name && !name.startsWith("xmlns")) {
          var safeName = Forms.safeIdentifier(name);
          object[safeName] = value;
        }
      }
    }
  }


  export function appendAttributes(object: any, element, ignorePropertyNames: string[]) {
    angular.forEach(object, (value, key) => {
      if (ignorePropertyNames.any(key)) {
        //console.log("Ignored key " + key);
      } else {
        // lets add an attribute value
        if (value) {
          var text = value.toString();
          // lets replace any underscores with dashes
          var name = key.replace(/_/g, '-');
          element.setAttribute(name, text);
        }
      }
    });
  }

  /**
   * Adds a new child element for this mapping to the given element
   * @method appendElement
   * @param {any} object
   * @param {any} element
   * @param {String} elementName
   * @param {Number} indentLevel
   * @return the last child element created
   */
  export function appendElement(object: any, element, elementName: string = null, indentLevel = 0) {
    var answer = null;
    if (angular.isArray(object)) {
      angular.forEach(object, (child) => {
        answer = appendElement(child, element, elementName, indentLevel);
      });
    } else if (object) {
      if (!elementName) {
        var className = Core.pathGet(object, ["constructor", "name"]);
        if (!className) {
          console.log("WARNING: no class name for value " + object);
        } else {
          elementName = elementNameMappings[className];
          if (!elementName) {
            console.log("WARNING: could not map class name " + className + " to an XML element name");
          }
        }
      }
      if (elementName) {
        if (indentLevel) {
          var text = indentText(indentLevel);
          Dozer.addTextNode(element, text);
        }
        var doc = element.ownerDocument || document;
        var child = doc.createElement(elementName);

        // navigate child properties...
        var fn = object.saveToElement;
        if (fn) {
          fn.apply(object, [child]);
        } else {
          angular.forEach(object, (value, key) => {
            console.log("has key " + key + " value " + value);
          });
        }
        // if we have any element children then add newline text node
        if ($(child).children().length) {
          //var text = indentText(indentLevel - 1);
          var text = indentText(indentLevel);
          Dozer.addTextNode(child, text);
        }
        element.appendChild(child);
        answer = child;
      }
    }
    return answer;
  }

  export function  nameOf(object: any) {
    var text = angular.isObject(object) ? object["value"] : null;
    if (!text && angular.isString(object)) {
      text = object;
    }
    return text || "?";
  }


  export function addTextNode(element, text: string) {
    if (text) {
      var doc = element.ownerDocument || document;
      var child = doc.createTextNode(text);
      element.appendChild(child);
    }
  }

  function indentText(indentLevel) {
    var text = "\n";
    for (var i = 0; i < indentLevel; i++) {
      text += "  ";
    }
    return text;
  }
}
