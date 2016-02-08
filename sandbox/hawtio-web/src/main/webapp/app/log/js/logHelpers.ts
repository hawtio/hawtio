/**
 * @module Log
 */
 /// <reference path="../../core/js/coreHelpers.ts"/>
module Log {

  export var log:Logging.Logger = Logger.get("Logs");

  export function logSourceHref(row) {
    if (!row) {
      return "";
    }
    var log = row.entity;
    if (log) {
      return logSourceHrefEntity(log);
    } else {
      return logSourceHrefEntity(row);
    }
  }

  export function treeContainsLogQueryMBean(workspace) {
    return workspace.treeContainsDomainAndProperties('hawtio', {type: 'LogQuery'}) || workspace.treeContainsDomainAndProperties('io.fabric8.insight', {type: 'LogQuery'});
  }

  export function isSelectionLogQueryMBean(workspace) {
    return workspace.hasDomainAndProperties('hawtio', {type: 'LogQuery'}) || workspace.hasDomainAndProperties('io.fabric8.insight', {type: 'LogQuery'});
  }

  export function findLogQueryMBean(workspace) {
    var node = workspace.findMBeanWithProperties('hawtio', {type: 'LogQuery'});
    if (!node) {
      node = workspace.findMBeanWithProperties('io.fabric8.insight', {type: 'LogQuery'});
    }
    return node ? node.objectName : null;
  }

  export function logSourceHrefEntity(log) {
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

  export function hasLogSourceHref(log) {
    var properties = log.properties;
    if (!properties) {
      return false;
    }
    var mavenCoords = "";
    if (properties) {
      mavenCoords = properties["maven.coordinates"];
    }
    return angular.isDefined(mavenCoords) && mavenCoords !== "";
  }

  export function hasLogSourceLineHref(log) {
    var line = log["lineNumber"];
    return angular.isDefined(line) && line !== "" && line !== "?";
  }

  export function removeQuestion(text: string): string {
    return (!text || text === "?") ? null : text;
  }

  var _stackRegex = /\s*at\s+([\w\.$_]+(\.([\w$_]+))*)\((.*)?:(\d+)\).*\[(.*)\]/

  export function formatStackTrace(exception:any) {
    if (!exception) {
      return '';
    }
    // turn exception into an array
    if (!angular.isArray(exception) && angular.isString(exception)) {
      exception = exception.split('\n');
    }

    if (!angular.isArray(exception)) {
      return "";
    }

    var answer = '<ul class="unstyled">\n';
    exception.each((line) => {
      answer += "<li>" + Log.formatStackLine(line) + "</li>\n"
    });
    answer += "</ul>\n";
    return answer;
  }

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
        return "<div class='stack-line'>  at <a href='" + link + "'>" + classAndMethod + "</a>(<span class='fileName'>" + fileName + "</span>:<span class='lineNumber'>" + line + "</span>)[<span class='mavenCoords'>" + mvnCoords + "</span>]</div>";
      }
    }
    var bold = true;
    if (line) {
      line = line.trim();
      if (line.startsWith('at')) {
        line = '  '  + line;
        bold = false;
      }
    }
    if (bold) {
      return '<pre class="stack-line bold">' + line + '</pre>';
    } else {
      return '<pre class="stack-line">' + line + '</pre>';
    }
  }

  export function getLogCacheSize(localStorage) {
    var text = localStorage['logCacheSize'];
    if (text) {
      return parseInt(text);
    }
    return 1000;
  }
}
