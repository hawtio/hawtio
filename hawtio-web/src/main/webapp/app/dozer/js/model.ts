module Dozer {
  export class Mappings {
    constructor(public doc:any, public mappings:Mapping[] = []) {
    }
  }

  export class Mapping {
    class_a:MappingClass;
    class_b:MappingClass;
    fields:Field[] = [];

    name() {
      return nameOf(this.class_a) + " -> " + nameOf(this.class_b);
    }

    saveToElement(element) {
      appendElement(this.class_a, element, "class-a");
      appendElement(this.class_b, element, "class-b");
      appendElement(this.fields, element, "field");
      appendAttributes(this, element, ["class_a", "class_b", "fields"]);
    }
  }


  export class MappingClass {
    constructor(public value:string) {
    }

    saveToElement(element) {
      Dozer.addTextNode(element, this.value);
      appendAttributes(this, element, ["value"]);
    }
  }

  export class Field {
    constructor(public a:FieldDefinition, public b:FieldDefinition) {
    }

    name() {
      return nameOf(this.a) + " -> " + nameOf(this.b);
    }

    saveToElement(element) {
      appendElement(this.a, element, "a");
      appendElement(this.b, element, "b");
      appendAttributes(this, element, ["a", "b"]);
    }
  }

  export class FieldDefinition {
    constructor(public value:string) {
    }

    saveToElement(element) {
      Dozer.addTextNode(element, this.value);
      appendAttributes(this, element, ["value"]);
    }
  }

}