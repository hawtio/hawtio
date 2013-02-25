module Log {
  export function logSourceHref(row) {
    var log = row.entity;
    var fileName = log.fileName;
    var className = log.className;
    if ((!fileName || fileName === "?") && className) {
      fileName = className.replace(".", "/") + ".java";
    }
    var groupId = "";
    var artifactId = "";
    var version = "";
    var properties = log.properties;
    if (properties) {
      var coords = properties["maven.coordinates"];
      if (coords) {
        var values = coords.split(":");
        if (values.length > 2) {
          groupId = values[0];
          artifactId = values[1];
          version = values[2];
        }
      }
    }
    if (groupId && artifactId && version) {
      return "#/source/view/" + groupId + "/" + artifactId + "/" + version + "/" + fileName;
    } else {
      return "";
    }
  }
}
