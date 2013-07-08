module Dozer {

  export var jmxDomain = 'net.sourceforge.dozer';

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
    mapping.classA = createMappingClass(elementJQ.children("class-a"));
    mapping.classB = createMappingClass(elementJQ.children("class-b"));
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
      var field = new Field(a, b);
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

  export class Mappings {
    constructor(public doc: any, public mappings: Mapping[] = []) {
    }
  }

  export class Mapping {
    classA: MappingClass;
    classB: MappingClass;
    fields: Field[] = [];

    name() {
      return className(this.classA) + " -> " + className(this.classB);
    }
  }

  function className(mappingClass: MappingClass) {
    var defaultValue = "?";
    if (mappingClass) {
      return mappingClass.name || defaultValue;
    }
    return defaultValue;
  }

  function nameOf(text: string) {
    return text || "?";
  }

  export class MappingClass {
    constructor(public name: string) {
    }
  }

  export class Field {
    constructor(public a: string, public b: string) {
    }

    name() {
      return nameOf(this.a) + " -> " + nameOf(this.b);
    }

  }
}