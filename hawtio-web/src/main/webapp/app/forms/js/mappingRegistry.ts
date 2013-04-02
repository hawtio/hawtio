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
      case "array":
      case "object[]":

        // TODO hack for now - objects should not really use the table, thats only really for arrays...
      case "object":
      case "java.lang.object":
        return "hawtio-form-object";
      default:
        // lets check if this name is an alias to a definition in the schema
        return "hawtio-form-text";
    }
  }
}
