/**
 * @module Dozer
 */
module Dozer {

  /**
   * @class Mappings
   */
  export class Mappings {
    constructor(public doc:any, public mappings:Mapping[] = []) {
    }
  }

  /**
   * @class Mapping
   */
  export class Mapping {
    map_id:string;
    class_a:MappingClass;
    class_b:MappingClass;
    fields:Field[] = [];

    constructor() {
      this.map_id = Core.getUUID();
      this.class_a = new MappingClass('');
      this.class_b = new MappingClass('');
    }

    name() {
      return nameOf(this.class_a) + " -> " + nameOf(this.class_b);
    }

    hasFromField(name:string) {
      return this.fields.find(f => name === f.a.value);
    }

    hasToField(name:string) {
      return this.fields.find(f => name === f.b.value);
    }

    saveToElement(element) {
      appendElement(this.class_a, element, "class-a", 2);
      appendElement(this.class_b, element, "class-b", 2);
      appendElement(this.fields, element, "field", 2);
      appendAttributes(this, element, ["class_a", "class_b", "fields"]);
    }
  }

  /**
   * @class MappingClass
   */
  export class MappingClass {
    constructor(public value:string) {
    }

    saveToElement(element) {
      Dozer.addTextNode(element, this.value);
      appendAttributes(this, element, ["value", "properties", "error"]);
    }
  }
  /**
   * @class Field
   */
  export class Field {
    constructor(public a:FieldDefinition, public b:FieldDefinition) {
    }

    name() {
      return nameOf(this.a) + " -> " + nameOf(this.b);
    }

    saveToElement(element) {
      appendElement(this.a, element, "a", 3);
      appendElement(this.b, element, "b", 3);
      appendAttributes(this, element, ["a", "b"]);
    }
  }

  /**
   * @class FieldDefinition
   */
  export class FieldDefinition {
    constructor(public value:string) {
    }

    saveToElement(element) {
      Dozer.addTextNode(element, this.value);
      appendAttributes(this, element, ["value", "properties", "error"]);
    }
  }

  /**
   * @class UnmappedField
   */
  export class UnmappedField {
    constructor(public fromField:string, public property:any, public toField:string = null) {
    }
  }
}
