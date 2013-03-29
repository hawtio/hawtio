module Forms {

  export function normalize(type) {
    switch ((type || "").toLowerCase()) {
      case "int":
      case "integer":
      case "long":
      case "short":
      case "java.lang.integer":
      case "java.lang.long":
        return "hawtio-form-number";
      case "object":
      case "java.lang.object":
        return "hawtio-form-object";
      default:
        return "hawtio-form-text";
    }
  }

}
