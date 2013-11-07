module Wiki {

  export var camelNamespaces = ["http://camel.apache.org/schema/spring", "http://camel.apache.org/schema/blueprint"];
  export var springNamespaces = ["http://www.springframework.org/schema/beans"];
  export var droolsNamespaces = ["http://drools.org/schema/drools-spring"];
  export var dozerNamespaces = ["http://dozer.sourceforge.net"];
  export var activemqNamespaces = ["http://activemq.apache.org/schema/core"];

  export var customViewLinks = ["/wiki/formTable", "/wiki/camel/diagram", "/wiki/camel/canvas", "/wiki/camel/properties", "/wiki/dozer/mappings"];


  export var excludeAdjustmentPrefixes = ["http://", "https://", "#"];

  /**
   * Which extensions do we wish to hide in the wiki file listing
   */
  export var hideExtentions = [".profile"];

  /**
   * The wizard tree for creating new content in the wiki
   */
  export var documentTemplates = [
    {
      label: "Folder",
      tooltip: "Create a new folder to contain documents",
      folder: true,
      icon: "/app/wiki/img/folder.gif",
      exemplar: "New Folder"
    },
    {
      label: "Fabric Profile",
      tooltip: "Create a new empty Fabric profile.  Using a hyphen ('-') will create a folder heirarchy, for example 'my-awesome-profile' will be available via the path 'my/awesome/profile'.",
      profile: true,
      addClass: "icon-book green",
      exemplar: "user-profile"
    },
    {
      label: "Properties File",
      tooltip: "A properties file typically used to configure Java classes",
      exemplar: "properties-file.properties"
    },
    {
      label: "Markdown Document",
      tooltip: "A basic markup document using the Markdown wiki markup, particularly useful for ReadMe files in directories",
      exemplar: "ReadMe.md"
    },
    {
      label: "HTML Document",
      tooltip: "A HTML document you can edit directly using the HTML markup",
      exemplar: "document.html"
    },
    {
      label: "XML Document",
      tooltip: "An empty XML document",
      exemplar: "document.xml"
    },
    {
      label: "Integration Flows",
      tooltip: "Camel routes for defining your integration flows",
      children: [
        {
          label: "Camel XML document",
          tooltip: "A vanilla Camel XML document for integration flows",
          icon: "/app/camel/img/camel.png",
          exemplar: "camel.xml"
        },
        {
          label: "Camel OSGi Blueprint XML document",
          tooltip: "A vanilla Camel XML document for integration flows when using OSGi Blueprint",
          icon: "/app/camel/img/camel.png",
          exemplar: "camel-blueprint.xml"
        },
        {
          label: "Camel Spring XML document",
          tooltip: "A vanilla Camel XML document for integration flows when using the Spring framework",
          icon: "/app/camel/img/camel.png",
          exemplar: "camel-spring.xml"
        }
      ]
    },
    {
      label: "Data Mapping Document",
      tooltip: "Dozer based configuration of mapping documents",
      icon: "/app/dozer/img/dozer.gif",
      exemplar: "dozerMapping.xml"
    }
  ];

  export function isWikiEnabled(workspace:Workspace, jolokia, localStorage) {
    return Git.createGitRepository(workspace, jolokia, localStorage) !== null;
  }
  /**
   * Returns a new create documnet wizard tree
   */
  export function createWizardTree() {
    var root = new Folder("New Documents");
    addCreateWizardFolders(root, documentTemplates);
    return root;
  }

  export function addCreateWizardFolders(parent: Folder, templates: any[]) {
    angular.forEach(templates, (template) => {
      var title = template.label || key;
      var node = new Folder(title);
      node.parent = parent;
      node.entity = template;

      var addClass = template.addClass;
      if (addClass) {
        node.addClass = addClass;
      }

      var key = template.exemplar;
      var parentKey = parent.key || "";
      node.key = parentKey ? parentKey + "_" + key : key;
      var icon = template.icon;
      if (icon) {
        node.icon = url(icon);
      }
      // compiler was complaining about 'label' had no idea where it's coming from
      // var tooltip = value["tooltip"] || value["description"] || label;
      var tooltip = template["tooltip"] || template["description"] || '';
      node.tooltip = tooltip;
      if (template["folder"]) {
        node.isFolder = () => { return true; };
      }
      parent.children.push(node);

      var children = template.children;
      if (children) {
        addCreateWizardFolders(node, children);
      }
    });
  }

  export function startLink(branch:string) {
    var start = "#/wiki";
    if (branch) {
      start += "/branch/" + branch;
    }
    return start;
  }

  export function viewLink(branch:string, pageId:string, $location, fileName:string = null) {
    var link = null;
    var start = startLink(branch);
    if (pageId) {
      link = start + "/view/" + encodePath(Core.trimLeading(pageId, "/"));
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

  export function branchLink(branch:string, pageId: string, $location, fileName:string = null) {
    return viewLink(branch, pageId, $location, fileName);
  }

  export function editLink(branch:string, pageId:string, $location) {
    var link = null;
    var start = startLink(branch);
    if (pageId) {
      link = start + "/edit/" + encodePath(pageId);
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
      link = start + "/create/" + encodePath(pageId);
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

  export function encodePath(pageId:string) {
    return pageId.split("/").map(encodeURIComponent).join("/");
  }

  export function decodePath(pageId:string) {
    return pageId.split("/").map(decodeURIComponent).join("/");
  }

  export function fileFormat(name:string, fileExtensionTypeRegistry) {
    var extension = fileExtension(name);
    var answer = null;
    angular.forEach(fileExtensionTypeRegistry, (array, key) => {
      if (array.indexOf(extension) >= 0) {
        answer = key;
      }
    });
    return answer;
  }

  /**
   * Returns the file name of the given path; stripping off any directories
   */
  export function fileName(path: string) {
    if (path) {
       var idx = path.lastIndexOf("/");
      if (idx > 0) {
        return path.substring(idx + 1);
      }
    }
    return path;
  }

  /**
   * Returns the folder of the given path (everything but the last path name)
   */
  export function fileParent(path: string) {
    if (path) {
       var idx = path.lastIndexOf("/");
      if (idx > 0) {
        return path.substring(0, idx);
      }
    }
    // lets return the root directory
    return "";
  }

  /**
   * Returns the file name for the given name; we hide some extensions
   */
  export function hideFineNameExtensions(name) {
    if (name) {
      angular.forEach(Wiki.hideExtentions, (extension) => {
        if (name.endsWith(extension)) {
          name = name.substring(0, name.length - extension.length);
        }
      });
    }
    return name;
  }

  export function fileIconHtml(row) {
    var css = null;
    var icon = null;
    var name = row.getProperty("name");
    var extension = fileExtension(name);
    var directory = row.getProperty("directory");

    // TODO could we use different icons for markdown v xml v html
    var xmlNamespaces = row.xmlNamespaces || row.entity.xmlNamespaces;
    if (xmlNamespaces && xmlNamespaces.length) {
      if (xmlNamespaces.any((ns) => Wiki.camelNamespaces.any(ns))) {
        icon = "/app/camel/img/camel.png";
      } else if (xmlNamespaces.any((ns) => Wiki.dozerNamespaces.any(ns))) {
        icon = "/app/dozer/img/dozer.gif";
      } else if (xmlNamespaces.any((ns) => Wiki.activemqNamespaces.any(ns))) {
        icon = "/app/activemq/img/message_broker.png";
      } else {
        console.log("file " + name + " has namespaces " + xmlNamespaces);
      }
    }

    if (!icon) {
      if (directory) {
        if ("profile" === extension) {
          css = "icon-book";
        } else {
          css = "icon-folder-close";
        }
      } else if ("xml" === extension) {
        css = "icon-file-text";
      } else {
        css = "icon-file-alt";
      }
    }
    if (icon) {
      return "<img src='" + url(icon) + "'>";
    } else {
      return "<i class='" + css + "'></i>";
    }
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
    $scope.startLink = Wiki.startLink($scope.branch);
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

  export function pageIdFromURI(url:string) {
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
    if (name.indexOf('#') > 0)
      name = name.substring(0, name.indexOf('#'));
    return Core.fileExtension(name, "markdown");
  }


  export function onComplete(status) {
    console.log("Completed operation with status: " + JSON.stringify(status));
  }

  /**
   * Parses the given JSON text reporting to the user if there is a parse error
   */
  export function parseJson(text:string) {
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
