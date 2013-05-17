
module Wiki {

  export var camelNamespaces = ["http://camel.apache.org/schema/spring", "http://camel.apache.org/schema/blueprint"];
  export var springNamespaces = ["http://www.springframework.org/schema/beans"];
  export var droolsNamespaces = ["http://drools.org/schema/drools-spring"];

  export function startLink(branch:string) {
    var start = "#/wiki";
    if (branch) {
      start += "/branch/" + branch;
    }
    return start;
  }

  export function viewLink(branch:string, pageId:string, $location, fileName: string = null) {
    var link = null;
    var start = startLink(branch);
    if (pageId) {
      link = start + "/view/" + pageId;
    } else {
      // lets use the current path
      var path = $location.path();
      link = "#" + path.replace(/(edit|create)/, "view");
    }
    if (fileName) {
      if (!link.endsWith("/")) {
        link += "/";
      }
      link += fileName;
    }
    return link;
  }


  export function editLink(branch:string, pageId:string, $location) {
    var link = null;
    var start = startLink(branch);
    if (pageId) {
      link = start + "/edit/" + pageId;
    } else {
      // lets use the current path
      var path = $location.path();
      link = "#" + path.replace(/(view|create)/, "edit");
    }
    return link;
  }

  export function createLink(branch:string, pageId:string, $location, $scope) {
    var path = $location.path();
    var start = startLink(branch);
    var link = null;
    if (pageId) {
      link = start + "/create/" + pageId;
    } else {
      // lets use the current path
      link = "#" + path.replace(/(view|edit|formTable)/, "create");
    }
    // we have the link so lets now remove the last path
    // or if there is no / in the path then remove the last section
    var idx = link.lastIndexOf("/");
    if (idx > 0 && !$scope.children && !path.startsWith("/wiki/formTable")) {
      link = link.substring(0, idx + 1);
    }
    return link;
  }

  export function fileFormat(name: string, fileExtensionTypeRegistry) {
    var extension = fileExtension(name);
    var answer = null;
    angular.forEach(fileExtensionTypeRegistry, (array, key) => {
      if (array.indexOf(extension) >= 0) {
        answer = key;
      }
    });
    return answer;
  }


  export function iconClass(row) {
    var name = row.getProperty("name");
    var extension = fileExtension(name);
    var directory = row.getProperty("directory");
    if (directory) {
      return "icon-folder-close";
    }
    if ("xml" === extension) {
      return "icon-cog";
    }
    // TODO could we use different icons for markdown v xml v html
    return "icon-file-alt";
  }


  /**
   * Extracts the pageId, branch, objectId from the route parameters
   */
  export function initScope($scope, $routeParams, $location) {
    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.branch = $routeParams["branch"] || $location.search()["branch"];
    $scope.objectId = $routeParams["objectId"];
  }


  /**
   * Extracts the pageId from the route parameters
   */
  export function pageId($routeParams, $location) {
    var pageId = $routeParams['page'];
    if (!pageId) {
      // Lets deal with the hack of AngularJS not supporting / in a path variable
      for (var i = 0; i < 100; i++) {
        var value = $routeParams['path' + i];
        if (angular.isDefined(value)) {
          if (!pageId) {
            pageId = value;
          } else {
            pageId += "/" + value;
          }
        } else break;
      }
      return pageId || "/";
    }

    // if no $routeParams variables lets figure it out from the $location
    if (!pageId) {
      pageId = pageIdFromURI($location.path());
    }
    return pageId;
  }

  export function pageIdFromURI(url: string) {
    var wikiPrefix = "/wiki/";
    if (url && url.startsWith(wikiPrefix)) {
      var idx = url.indexOf("/", wikiPrefix.length + 1);
      if (idx > 0) {
        return url.substring(idx + 1, url.length)
      }
    }
    return null

  }

  export function fileExtension(name) {
    return Core.fileExtension(name, "markdown");
  }


  export function onComplete(status) {
    console.log("Completed operation with status: " + JSON.stringify(status));
  }

  /**
   * Parses the given JSON text reporting to the user if there is a parse error
   */
  export function parseJson(text: string) {
    if (text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        notification("error", "Failed to parse JSON: " + e);
      }
    }
    return null;
  }
}
