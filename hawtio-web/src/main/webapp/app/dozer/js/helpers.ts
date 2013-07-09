module Dozer {

  export var jmxDomain = 'net.sourceforge.dozer';

  /**
   * Lets map the class names to element names
   */
  export var elementNameMappings = {
    "Mapping": "mapping",
    "MappingClass": "class",
    "Field": "field"
  };

  /**
   * Converts the XML string or DOM node to a Dozer model
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
    appendElement(model.mappings, element);
    var xmlText = Core.xmlNodeToString(element);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlText;
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
      var mappingName = mapping.name();
      var mappingFolder = new Folder(mappingName);
      mappingFolder.addClass = "net-sourceforge-dozer-mapping";
      mappingFolder.typeName = "mapping";
      mappingFolder.domain = Dozer.jmxDomain;
      mappingFolder.key = folder.key + "_" + Core.toSafeDomID(mappingName);
      mappingFolder.parent = folder;
      mappingFolder.entity = mapping;

/*
      mappingFolder.tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || id;
      mappingFolder.icon = imageUrl;
*/

      folder.children.push(mappingFolder);

      addMappingFields(mappingFolder, mapping);
    });
    return folder;
  }

  function addMappingFields(folder: Folder, mapping: Mapping) {

    angular.forEach(mapping.fields, (field) => {
      var name = field.name();
      var fieldFolder = new Folder(name);
      fieldFolder.addClass = "net-sourceforge-dozer-field";
      fieldFolder.typeName = "field";
      fieldFolder.domain = Dozer.jmxDomain;
      fieldFolder.key = folder.key + "_" + Core.toSafeDomID(name);
      fieldFolder.parent = folder;
      fieldFolder.entity = field;

/*
      fieldFolder.tooltip = nodeSettings["tooltip"] || nodeSettings["description"] || id;
      fieldFolder.icon = imageUrl;
*/

      folder.children.push(fieldFolder);
    });
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
    return null;
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
    return null;
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
   *
   * @returns the last child element created
   */
  export function appendElement(object: any, element, elementName: string = null) {
    var answer = null;
    if (angular.isArray(object)) {
      angular.forEach(object, (child) => {
        answer = appendElement(child, element, elementName);
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
}