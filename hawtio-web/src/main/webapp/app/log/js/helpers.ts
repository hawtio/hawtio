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
      var link = "#/source/view/" + mavenCoords + "/class/" + className + "/" + fileName;
      var line = log.lineNumber;
      if (line) {
        link += "?line=" + line;
      }
      return link;
    } else {
      return "";
    }
  }

  export function removeQuestion(text: string): string {
    return (!text || text === "?") ? null : text;
  }

  var _stackRegex = /\s*at\s+([\w\.$_]+(\.([\w$_]+))*)\((.*)?:(\d+)\).*\[(.*)\]/

  export function formatStackLine(line: string): string {
    var match = _stackRegex.exec(line);
    if (match && match.length > 6) {
      var classAndMethod = match[1];
      var fileName = match[4];
      var line = match[5];
      var mvnCoords = match[6];
      // we can ignore line if its not present...
      if (classAndMethod && fileName && mvnCoords) {
        var className = classAndMethod;
        var idx = classAndMethod.lastIndexOf('.');
        if (idx > 0) {
          className = classAndMethod.substring(0, idx);
        }
        var link = "#/source/view/" + mvnCoords + "/class/" + className + "/" + fileName;
        if (angular.isDefined(line)) {
          link += "?line=" + line;
        }
/*
        console.log("classAndMethod: " + classAndMethod);
        console.log("fileName: " + fileName);
        console.log("line: " + line);
        console.log("mvnCoords: " + mvnCoords);
        console.log("Matched " + JSON.stringify(match));
*/
        return "at <a href='" + link + "'>" + classAndMethod + "</a>(<span class='fileName'>" + fileName + "</span>:<span class='lineNumber'>" + line + "</span>)[<span class='mavenCoords'>" + mvnCoords + "</span>]";
      }
    }
    return line;
  }
}
