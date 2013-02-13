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
}