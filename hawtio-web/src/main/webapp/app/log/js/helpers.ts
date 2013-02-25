module Log {
  export function logSourceHref(row) {
    var log = row.entity;
    var fileName = Log.removeQuestion(log.fileName);
    var className = Log.removeQuestion(log.className);
    var properties = log.properties;
    var mavenCoords = "";
    if (properties) {
      mavenCoords = properties["maven.coordinates"];
    }
    if (mavenCoords && fileName) {
      return "#/source/view/" + mavenCoords + "/" + className + "/" + fileName;
    } else {
      return "";
    }
  }

  export function removeQuestion(text: string): string {
    return (!text || text === "?") ? null : text;
  }
}
