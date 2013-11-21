module Source {

  export var log:Logging.Logger = Logger.get("Source");

  export function getInsightMBean(workspace) {
    var mavenStuff = workspace.mbeanTypesToDomain["LogQuery"] || {};
    var insight = mavenStuff["org.fusesource.insight"] || {};
    var mbean = insight.objectName;
    return mbean;
  }

  export function createBreadcrumbLinks(mavenCoords: string, pathName: string) {
    var linkPrefix = "#/source/index/" + mavenCoords;
    var answer = [{href: linkPrefix, name: "root"}];
    if (pathName) {
      var pathNames = pathName.split("/");
      var fullPath = "";
      angular.forEach(pathNames, (path) => {
        fullPath += "/" + path;
        var href = linkPrefix + fullPath;
        if (!path.isBlank()) {
          answer.push({href: href, name: path || "/", fileName: "/" + fullPath});
        }
      });
    }
    return answer;
  }
}
