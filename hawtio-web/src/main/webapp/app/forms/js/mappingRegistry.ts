module Forms {

  export function normalize(type, schema) {
    type = Forms.resolveTypeNameAlias(type, schema);
    if (!type) {
      return "hawtio-form-text";
    }
    switch (type.toLowerCase()) {
      case "int":
      case "integer":
      case "long":
      case "short":
      case "java.lang.integer":
      case "java.lang.long":
      case "float":
      case "double":
      case "java.lang.float":
      case "java.lang.double":
        return "hawtio-form-number";

      // collections or arrays
      case "array":
      case "java.lang.array":
      case "java.lang.iterable":
      case "java.util.list":
      case "java.util.collection":
      case "java.util.iterator":
      case "java.util.set":
      case "object[]":

        // TODO hack for now - objects should not really use the table, thats only really for arrays...
/*
      case "object":
      case "java.lang.object":
*/
        return "hawtio-form-array";
      case "boolean":
      case "bool":
      case "java.lang.boolean":
        return "hawtio-form-checkbox";
      default:
        // lets check if this name is an alias to a definition in the schema
        return "hawtio-form-text";
    }
  }
}
