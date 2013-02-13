module Wiki {

  export function viewLink(pageId:string, $location, fileName: string = null) {
    var link = null;
    if (pageId) {
      link = "#/wiki/view/" + pageId;
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


  export function editLink(pageId:string, $location) {
    var link = null;
    if (pageId) {
      link = "#/wiki/edit/" + pageId;
    } else {
      // lets use the current path
      var path = $location.path();
      link = "#" + path.replace(/(view|create)/, "edit");
    }
    return link;
  }

  export function createLink(pageId:string, $location) {
    var link = null;
    if (pageId) {
      link = "#/wiki/create/" + pageId;
    } else {
      // lets use the current path
      var path = $location.path();
      link = "#" + path.replace(/(view|edit)/, "create");
    }
    // we have the link so lets now remove the last path
    // or if there is no / in the path then remove the last section
    var idx = link.lastIndexOf("/");
    if (idx > 0) {
      link = link.substring(0, idx + 1);
    }
    return link;
  }

  export function fileFormat(name: string, fileExtensionTypeRegistry) {
    var extension = Core.fileExtension(name, "markdown");
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
    var extension = Core.fileExtension(name, "markdown");
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
   * Extracts the pageId from the route parameters
   */
  export function pageId($routeParams) {
    var pageId = $routeParams['page'];
    if (!pageId) {
      // Lets deal with the hack of AngularJS not supporting / in a path variable
      for (var i = 0; i < 100; i++) {
        var value = $routeParams['path' + i];
        if (value) {
          if (!pageId) {
            pageId = value;
          } else {
            pageId += "/" + value;
          }
        } else break;
      }
    }
    return pageId;
  }
}