module Log {
  export function logSourceHref(row) {
    var log = row.entity;
    var fileName = Log.removeQuestion(log.fileName);
    var className = Log.removeQuestion(log.className);
    if (className && !fileName) {
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
    if (groupId && artifactId && version && fileName) {
      return "#/source/view/" + groupId + "/" + artifactId + "/" + version + "/" + fileName;
    } else {
      return "";
    }
  }

  export function removeQuestion(text: string): string {
    return (!text || text === "?") ? null : text;
  }
}
