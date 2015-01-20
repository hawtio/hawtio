/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../git/js/gitHelpers.ts"/>
/// <reference path="../../git/js/git.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../docker-registry/js/dockerRegistryHelpers.ts"/>
/**
 * @module Wiki
 */
module Wiki {

  export var log:Logging.Logger = Logger.get("Wiki");

  export var camelNamespaces = ["http://camel.apache.org/schema/spring", "http://camel.apache.org/schema/blueprint"];
  export var springNamespaces = ["http://www.springframework.org/schema/beans"];
  export var droolsNamespaces = ["http://drools.org/schema/drools-spring"];
  export var dozerNamespaces = ["http://dozer.sourceforge.net"];
  export var activemqNamespaces = ["http://activemq.apache.org/schema/core"];

  export var excludeAdjustmentPrefixes = ["http://", "https://", "#"];

  export enum ViewMode { List, Icon };

  /**
   * The custom views within the wiki namespace; either "/wiki/$foo" or "/wiki/branch/$branch/$foo"
   */
  export var customWikiViewPages = ["/formTable", "/camel/diagram", "/camel/canvas", "/camel/properties", "/dozer/mappings"];

  /**
   * Which extensions do we wish to hide in the wiki file listing
   * @property hideExtensions
   * @for Wiki
   * @type Array
   */
  export var hideExtensions = [".profile"];

  var defaultFileNamePattern = /^[a-zA-Z0-9._-]*$/;
  var defaultFileNamePatternInvalid = "Name must be: letters, numbers, and . _ or - characters";

  var defaultFileNameExtensionPattern = "";

  var defaultLowerCaseFileNamePattern = /^[a-z0-9._-]*$/;
  var defaultLowerCaseFileNamePatternInvalid = "Name must be: lower-case letters, numbers, and . _ or - characters";

  export interface GenerateOptions {
    workspace: Core.Workspace;
    form: any;
    name: string;
    branch: string;
    parentId: string;
    success: (fileContents?:string) => void;
    error: (error:any) => void;
  }

  /**
   * The wizard tree for creating new content in the wiki
   * @property documentTemplates
   * @for Wiki
   * @type Array
   */
  export var documentTemplates = [
    {
      label: "Folder",
      tooltip: "Create a new folder to contain documents",
      folder: true,
      icon: "/img/icons/wiki/folder.gif",
      exemplar: "myfolder",
      regex: defaultLowerCaseFileNamePattern,
      invalid: defaultLowerCaseFileNamePatternInvalid
    },
    {
      label: "App",
      tooltip: "Creates a new App folder used to configure and run containers",
      addClass: "icon-cog green",
      exemplar: 'myapp',
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: '',
      generated: {
        mbean: ['io.fabric8', { type: 'KubernetesTemplateManager' }],
        init: (workspace, $scope) => {

        },
        generate: (options:GenerateOptions) => {
          log.debug("Got options: ", options);
          options.form.name = options.name;
          options.form.path = options.parentId;
          options.form.branch = options.branch;
          var json = angular.toJson(options.form);
          var jolokia = <Jolokia.IJolokia> Core.injector.get("jolokia");
          jolokia.request({
            type: 'exec',
            mbean: 'io.fabric8:type=KubernetesTemplateManager',
            operation: 'createAppByJson',
            arguments: [json]
          }, onSuccess((response) => { 
            log.debug("Generated app, response: ", response);
            options.success(undefined); 
          }, {
            error: (response) => { options.error(response.error); }
          }));
        },
        form: (workspace, $scope) => {
          if (!$scope.doDockerRegistryCompletion) {
            $scope.fetchDockerRepositories = () => {
              return DockerRegistry.completeDockerRegistry();
            }
          }
          return {
            summaryMarkdown: 'Add app summary here',
            replicaCount: 1
          };
        },
        schema: {
          description: 'App settings',
          type: 'java.lang.String',
          properties: {
            'dockerImage': {
              'description': 'Docker Image',
              'type': 'java.lang.String',
              'input-attributes': { 
                'required': '', 
                'class': 'input-xlarge',
                'typeahead': 'repo for repo in fetchDockerRepositories() | filter:$viewValue',
                'typeahead-wait-ms': '200'
              }
            },
            'summaryMarkdown': {
              'description': 'Short Description',
              'type': 'java.lang.String',
              'input-attributes': { 'class': 'input-xlarge' }
            },
            'replicaCount': {
              'description': 'Replica Count',
              'type': 'java.lang.Integer',
              'input-attributes': {
                min: '0'
              }
            },
            'labels': {
              'description': 'Labels',
              'type': 'map',
              'items': {
                'type': 'string'
              }
            }
          }
        }
      }
    },
    {
      label: "Fabric8 Profile",
      tooltip: "Create a new empty fabric profile. Using a hyphen ('-') will create a folder heirarchy, for example 'my-awesome-profile' will be available via the path 'my/awesome/profile'.",
      profile: true,
      addClass: "icon-book green",
      exemplar: "user-profile",
      regex: defaultLowerCaseFileNamePattern,
      invalid: defaultLowerCaseFileNamePatternInvalid,
      fabricOnly: true
    },
    {
      label: "Properties File",
      tooltip: "A properties file typically used to configure Java classes",
      exemplar: "properties-file.properties",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".properties"
    },
    {
      label: "JSON File",
      tooltip: "A file containing JSON data",
      exemplar: "document.json",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".json"
    },
    {
      label: "Key Store File",
      tooltip: "Creates a keystore (database) of cryptographic keys, X.509 certificate chains, and trusted certificates.",
      exemplar: 'keystore.jks',
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".jks",
      generated: {
        mbean: ['hawtio', { type: 'KeystoreService' }],
        init: function(workspace, $scope) {
          var mbean = 'hawtio:type=KeystoreService';
          var response = workspace.jolokia.request( {type: "read", mbean: mbean, attribute: "SecurityProviderInfo" }, {
            success: (response)=>{
              $scope.securityProviderInfo = response.value;
              Core.$apply($scope);
            },
            error: (response) => {
              console.log('Could not find the supported security algorithms: ', response.error);
              Core.$apply($scope);
            }
          });
        },
        generate: function(options:GenerateOptions) {
          var encodedForm = JSON.stringify(options.form)
          var mbean = 'hawtio:type=KeystoreService';
          var response = options.workspace.jolokia.request( {
              type: 'exec', 
              mbean: mbean,
              operation: 'createKeyStoreViaJSON(java.lang.String)',
              arguments: [encodedForm]
            }, {
              method:'POST',
              success:function(response) {
                options.success(response.value)
              },
              error:function(response){
                options.error(response.error)
              }
            });
        },
        form: function(workspace, $scope){ 
          return { 
            storeType: $scope.securityProviderInfo.supportedKeyStoreTypes[0],
            createPrivateKey: false,
            keyLength: 4096,
            keyAlgorithm: $scope.securityProviderInfo.supportedKeyAlgorithms[0],
            keyValidity: 365
          }
        },
        schema: {
           "description": "Keystore Settings",
           "type": "java.lang.String",
           "properties": { 
             "storePassword": {
               "description": "Keystore password.",
               "type": "password",
               'input-attributes': { "required":  "",  "ng-minlength":6 }
             },
             "storeType": {
               "description": "The type of store to create",
               "type": "java.lang.String",
               'input-element': "select",
               'input-attributes': { "ng-options":  "v for v in securityProviderInfo.supportedKeyStoreTypes" }
             },
             "createPrivateKey": {
               "description": "Should we generate a self-signed private key?",
               "type": "boolean"
             },
             "keyCommonName": {
               "description": "The common name of the key, typically set to the hostname of the server",
               "type": "java.lang.String",
               'control-group-attributes': { 'ng-show': "formData.createPrivateKey" }
             },
             "keyLength": {
               "description": "The length of the cryptographic key",
               "type": "Long",
               'control-group-attributes': { 'ng-show': "formData.createPrivateKey" }
             },
             "keyAlgorithm": {
               "description": "The key algorithm",
               "type": "java.lang.String",
               'input-element': "select",
               'input-attributes': { "ng-options":  "v for v in securityProviderInfo.supportedKeyAlgorithms" },
               'control-group-attributes': { 'ng-show': "formData.createPrivateKey" }
             },
             "keyValidity": {
               "description": "The number of days the key will be valid for",
               "type": "Long",
               'control-group-attributes': { 'ng-show': "formData.createPrivateKey" }
             },
             "keyPassword": {
               "description": "Password to the private key",
               "type": "password",
               'control-group-attributes': { 'ng-show': "formData.createPrivateKey" }
             }
           }
        }
      }
    },
    {
      label: "Markdown Document",
      tooltip: "A basic markup document using the Markdown wiki markup, particularly useful for ReadMe files in directories",
      exemplar: "ReadMe.md",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".md"
    },
    {
      label: "Text Document",
      tooltip: "A plain text file",
      exemplar: "document.text",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".txt"
    },
    {
      label: "HTML Document",
      tooltip: "A HTML document you can edit directly using the HTML markup",
      exemplar: "document.html",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".html"
    },
    {
      label: "XML Document",
      tooltip: "An empty XML document",
      exemplar: "document.xml",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".xml"
    },
    {
      label: "Integration Flows",
      tooltip: "Camel routes for defining your integration flows",
      children: [
        {
          label: "Camel XML document",
          tooltip: "A vanilla Camel XML document for integration flows",
          icon: "/img/icons/camel.svg",
          exemplar: "camel.xml",
          regex: defaultFileNamePattern,
          invalid: defaultFileNamePatternInvalid,
          extension: ".xml"
        },
        {
          label: "Camel OSGi Blueprint XML document",
          tooltip: "A vanilla Camel XML document for integration flows when using OSGi Blueprint",
          icon: "/img/icons/camel.svg",
          exemplar: "camel-blueprint.xml",
          regex: defaultFileNamePattern,
          invalid: defaultFileNamePatternInvalid,
          extension: ".xml"
        },
        {
          label: "Camel Spring XML document",
          tooltip: "A vanilla Camel XML document for integration flows when using the Spring framework",
          icon: "/img/icons/camel.svg",
          exemplar: "camel-spring.xml",
          regex: defaultFileNamePattern,
          invalid: defaultFileNamePatternInvalid,
          extension: ".xml"
        }
      ]
    },
    {
      label: "Data Mapping Document",
      tooltip: "Dozer based configuration of mapping documents",
      icon: "/img/icons/dozer/dozer.gif",
      exemplar: "dozer-mapping.xml",
      regex: defaultFileNamePattern,
      invalid: defaultFileNamePatternInvalid,
      extension: ".xml"
    }
  ];

  export function isWikiEnabled(workspace:Workspace, jolokia, localStorage) {
    return Git.createGitRepository(workspace, jolokia, localStorage) !== null;
  }

  export function goToLink(link, $timeout, $location) {
    var href = Core.trimLeading(link, "#");
    $timeout(() => {
      log.debug("About to navigate to: " + href);
      $location.url(href);
    }, 100);
  }

  /**
   * Returns all the links for the given branch for the custom views, starting with "/"
   * @param $scope
   * @returns {string[]}
   */
  export function customViewLinks($scope) {
    var branch = $scope.branch;
    var prefix = Core.trimLeading(Wiki.startLink(branch), "#");
    return customWikiViewPages.map(path => prefix + path);
  }

  /**
   * Returns a new create document wizard tree
   * @method createWizardTree
   * @for Wiki
   * @static
   */
  export function createWizardTree(workspace:Workspace, $scope) {
    var root = new Folder("New Documents");
    addCreateWizardFolders(workspace, $scope, root, documentTemplates);
    return root;
  }


  export function addCreateWizardFolders(workspace:Workspace, $scope, parent: Folder, templates: any[]) {
    angular.forEach(templates, (template) => {

      if (template['fabricOnly'] && !Fabric.hasFabric(workspace)) {
        return;
      }

      if ( template.generated ) {
        if( template.generated.mbean ) {
          var exists = workspace.treeContainsDomainAndProperties.apply(workspace, template.generated.mbean) ;
          if( !exists ) {
            return;
          }
        }
        if ( template.generated.init ) {
          template.generated.init(workspace, $scope);
        }
      }

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
        node.icon = Core.url(icon);
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
        addCreateWizardFolders(workspace, $scope, node, children);
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

  /**
   * Returns true if the given filename/path is an index page (named index.* and is a markdown/html page).
   *
   * @param path
   * @returns {boolean}
   */
  export function isIndexPage(path: string) {
    return path && (path.endsWith("index.md") || path.endsWith("index.html") || path.endsWith("index")) ? true : false;
  }

  export function viewLink(branch:string, pageId:string, $location, fileName:string = null) {
    var link:string = null;
    var start = startLink(branch);
    if (pageId) {
      // figure out which view to use for this page
      var view = isIndexPage(pageId) ? "/book/" : "/view/";
      link = start + view + encodePath(Core.trimLeading(pageId, "/"));
    } else {
      // lets use the current path
      var path:string = $location.path();
      link = "#" + path.replace(/(edit|create)/, "view");
    }
    if (fileName && pageId && pageId.endsWith(fileName)) {
      return link;
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
    var link:string = null;
    var format = Wiki.fileFormat(pageId);
    switch (format) {
      case "image":
        break;
      default:
      var start = startLink(branch);
      if (pageId) {
        link = start + "/edit/" + encodePath(pageId);
      } else {
        // lets use the current path
        var path = $location.path();
        link = "#" + path.replace(/(view|create)/, "edit");
      }
    }
    return link;
  }

  export function createLink(branch:string, pageId:string, $location, $scope) {
    var path = $location.path();
    var start = startLink(branch);
    var link = '';
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

  export function fileFormat(name:string, fileExtensionTypeRegistry?) {
    var extension = fileExtension(name);
    var answer = null;
    if (!fileExtensionTypeRegistry) {
      fileExtensionTypeRegistry = Core.injector.get("fileExtensionTypeRegistry");
    }
    angular.forEach(fileExtensionTypeRegistry, (array, key) => {
      if (array.indexOf(extension) >= 0) {
        answer = key;
      }
    });
    return answer;
  }

  /**
   * Returns the file name of the given path; stripping off any directories
   * @method fileName
   * @for Wiki
   * @static
   * @param {String} path
   * @return {String}
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
   * @method fileParent
   * @for Wiki
   * @static
   * @param {String} path
   * @return {String}
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
   * @method hideFineNameExtensions
   * @for Wiki
   * @static
   * @param {String} name
   * @return {String}
   */
  export function hideFileNameExtensions(name) {
    if (name) {
      angular.forEach(Wiki.hideExtensions, (extension) => {
        if (name.endsWith(extension)) {
          name = name.substring(0, name.length - extension.length);
        }
      });
    }
    return name;
  }

  /**
   * Returns the URL to perform a GET or POST for the given branch name and path
   */
  export function gitRestURL(branch: string, path: string) {
    var url = gitRelativeURL(branch, path);
    url = Core.url('/' + url);

    var connectionName = Core.getConnectionNameParameter(location.search);
    if (connectionName) {
      var connectionOptions = Core.getConnectOptions(connectionName);
      if (connectionOptions) {
        connectionOptions.path = url;
        url = <string>Core.createServerConnectionUrl(connectionOptions);
      }
    }

    return url;
  }

  /**
   * Returns a relative URL to perform a GET or POST for the given branch/path
   */
  export function gitRelativeURL(branch: string, path: string) {
    branch = branch || "master";
    path = path || "/";
    return UrlHelpers.join("git/" + branch, path);
  }


  /**
   * Takes a row containing the entity object; or can take the entity directly.
   *
   * It then uses the name, directory and xmlNamespaces properties
   *
   * @method fileIconHtml
   * @for Wiki
   * @static
   * @param {any} row
   * @return {String}
   *
   */
  export function fileIconHtml(row) {
    var name = row.name;
    var path = row.path;
    var branch = row.branch ;
    var directory = row.directory;
    var xmlNamespaces = row.xmlNamespaces;
    var iconUrl = row.iconUrl;
    var entity = row.entity;
    if (entity) {
      name = name || entity.name;
      path = path || entity.path;
      branch = branch || entity.branch;
      directory = directory || entity.directory;
      xmlNamespaces = xmlNamespaces || entity.xmlNamespaces;
      iconUrl = iconUrl || entity.iconUrl;
    }
    branch = branch || "master";
    var css = null;
    var icon:string = null;
    var extension = fileExtension(name);
    // TODO could we use different icons for markdown v xml v html
    if (xmlNamespaces && xmlNamespaces.length) {
      if (xmlNamespaces.any((ns) => Wiki.camelNamespaces.any(ns))) {
        icon = "img/icons/camel.svg";
      } else if (xmlNamespaces.any((ns) => Wiki.dozerNamespaces.any(ns))) {
        icon = "img/icons/dozer/dozer.gif";
      } else if (xmlNamespaces.any((ns) => Wiki.activemqNamespaces.any(ns))) {
        icon = "img/icons/messagebroker.svg";
      } else {
        log.debug("file " + name + " has namespaces " + xmlNamespaces);
      }
    }
    if (iconUrl) {
      css = null;
      icon = UrlHelpers.join("git", iconUrl);
      var connectionName = Core.getConnectionNameParameter(location.search);
      if (connectionName) {
        var connectionOptions = Core.getConnectOptions(connectionName);
        if (connectionOptions) {
          connectionOptions.path = Core.url('/' + icon);
          icon = <string>Core.createServerConnectionUrl(connectionOptions);
        }
      }
    }
    if (!icon) {
      if (directory) {
        switch (extension) {
          case 'profile':
            css = "icon-book";
            break;
          default:
            // log.debug("No match for extension: ", extension, " using a generic folder icon");
            css = "icon-folder-close";
        }
      } else {
        switch (extension) {
          case 'png':
          case 'svg':
          case 'jpg':
          case 'gif':
            css = null;
            icon = Wiki.gitRelativeURL(branch, path);
            var connectionName = Core.getConnectionNameParameter(location.search);
            if (connectionName) {
              var connectionOptions = Core.getConnectOptions(connectionName);
              if (connectionOptions) {
                connectionOptions.path = Core.url('/' + icon);
                icon = <string>Core.createServerConnectionUrl(connectionOptions);
              }
            }
            break;
          case 'json':
          case 'xml':
            css = "icon-file-text";
            break;
          case 'md':
            css = "icon-file-text-alt";
            break;
          default:
            // log.debug("No match for extension: ", extension, " using a generic file icon");
            css = "icon-file-alt";
        }
      }
    }
    if (icon) {
      return "<img src='" + Core.url(icon) + "'>";
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
    } else if ("md" === extension) {
        return "icon-file-text-alt";
    }
    // TODO could we use different icons for markdown v xml v html
    return "icon-file-alt";
  }


  /**
   * Extracts the pageId, branch, objectId from the route parameters
   * @method initScope
   * @for Wiki
   * @static
   * @param {*} $scope
   * @param {any} $routeParams
   * @param {ng.ILocationService} $location
   */
  export function initScope($scope, $routeParams, $location) {
    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.branch = $routeParams["branch"] || $location.search()["branch"];
    $scope.objectId = $routeParams["objectId"];
    $scope.startLink = Wiki.startLink($scope.branch);
    $scope.historyLink = startLink($scope.branch) + "/history/" + ($scope.pageId || "");
  }

  /**
   * Loads the branches for this wiki repository and stores them in the branches property in
   * the $scope and ensures $scope.branch is set to a valid value
   *
   * @param wikiRepository
   * @param $scope
   * @param isFmc whether we run as fabric8 or as hawtio
   */
  export function loadBranches(jolokia, wikiRepository, $scope, isFmc = false) {
    if (isFmc) {
      // when using fabric then the branches is the fabric versions, so we should use that instead
      $scope.branches = Fabric.getVersionIds(jolokia);
      var defaultVersion = Fabric.getDefaultVersionId(jolokia);

      // use current default version as default branch
      if (!$scope.branch) {
        $scope.branch = defaultVersion;
      }

      // lets sort by version number
      $scope.branches = $scope.branches.sortBy((v) => Core.versionToSortableString(v), true);

      Core.$apply($scope);
    } else {
      wikiRepository.branches((response) => {
        // lets sort by version number
        $scope.branches = response.sortBy((v) => Core.versionToSortableString(v), true);

        // default the branch name if we have 'master'
        if (!$scope.branch && $scope.branches.find((branch) => {
          return branch === "master";
        })) {
          $scope.branch = "master";
        }
        Core.$apply($scope);
      });
    }
  }

  /**
   * Extracts the pageId from the route parameters
   * @method pageId
   * @for Wiki
   * @static
   * @param {any} $routeParams
   * @param @ng.ILocationService @location
   * @return {String}
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
   * @method parseJson
   * @for Wiki
   * @static
   * @param {String} text
   * @return {any}
   */
  export function parseJson(text:string) {
    if (text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        Core.notification("error", "Failed to parse JSON: " + e);
      }
    }
    return null;
  }

  /**
   * Adjusts a relative or absolute link from a wiki or file system to one using the hash bang syntax
   * @method adjustHref
   * @for Wiki
   * @static
   * @param {*} $scope
   * @param {ng.ILocationService} $location
   * @param {String} href
   * @param {String} fileExtension
   * @return {string}
   */
  export function adjustHref($scope, $location, href, fileExtension) {
    var extension = fileExtension ? "." + fileExtension : "";

    // if the last part of the path has a dot in it lets
    // exclude it as we are relative to a markdown or html file in a folder
    // such as when viewing readme.md or index.md
    var path = $location.path();
    var folderPath = path;
    var idx = path.lastIndexOf("/");
    if (idx > 0) {
      var lastName = path.substring(idx + 1);
      if (lastName.indexOf(".") >= 0) {
        folderPath = path.substring(0, idx);
      }
    }

    // Deal with relative URLs first...
    if (href.startsWith('../')) {
      var parts = href.split('/');
      var pathParts = folderPath.split('/');
      var parents = parts.filter((part) => {
        return part === "..";
      });
      parts = parts.last(parts.length - parents.length);
      pathParts = pathParts.first(pathParts.length - parents.length);

      return '#' + pathParts.join('/') + '/' + parts.join('/') + extension + $location.hash();
    }

    // Turn an absolute link into a wiki link...
    if (href.startsWith('/')) {
      return Wiki.branchLink($scope.branch, href + extension, $location) + extension;
    }

    if (!Wiki.excludeAdjustmentPrefixes.any((exclude) => {
      return href.startsWith(exclude);
    })) {
      return '#' + folderPath + "/" + href + extension + $location.hash();
    } else {
      return null;
    }
  }
}
