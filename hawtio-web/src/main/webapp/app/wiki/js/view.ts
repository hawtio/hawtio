module Wiki {

  export function ViewController($scope, $location, $routeParams, workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository, $compile) {
    Wiki.initScope($scope, $routeParams, $location);

    $scope.addDialog = new Core.Dialog();
    $scope.createDocumentTree = Wiki.createWizardTree();
    $scope.createDocumentTreeActivations = ["camel-spring.xml"];

    $scope.gridOptions = {
      data: 'children',
      displayFooter: false,
      columnDefs: [
        {
          field: 'name',
          displayName: 'Page Name',
          cellTemplate: '<div class="ngCellText"><a href="{{childLink(row.entity)}}"><i class="{{row | fileIconClass}}"></i> {{row.getProperty(col.field)}}</a></div>',
          cellFilter: ""
        },
        {
          field: 'lastModified',
          displayName: 'Modified',
          cellFilter: "date:'EEE, MMM d, y : hh:mm:ss a'"
        },
        {
          field: 'length',
          displayName: 'Size',
          cellFilter: "number"
        }
      ]
    };

    $scope.childLink = (child) => {
      var start = startLink($scope.branch);
      var prefix = start + "/view";
      var postFix = "";
      var path = child.path;
      if (child.directory) {
        // if we are a folder with the same name as a form file, lets add a form param...
        var formPath = path + ".form";
        var children = $scope.children;
        if (children) {
          var formFile = children.find({path: formPath});
          if (formFile) {
            prefix = start + "/formTable";
            postFix = "?form=" + formPath;
          }
        }
      } else {
        var xmlNamespaces = child.xmlNamespaces;
        if (xmlNamespaces && xmlNamespaces.length) {
          if (xmlNamespaces.any((ns) => Wiki.camelNamespaces.any(ns))) {
            prefix = start + "/camel/canvas";
          } else if (xmlNamespaces.any((ns) => Wiki.dozerNamespaces.any(ns))) {
            prefix = start + "/dozer/mappings";
          } else {
            console.log("child " + path + " has namespaces " + xmlNamespaces);
          }
        }
        if (child.path.endsWith(".form")) {
          postFix = "?form=/";
        }
      }
      return Core.createHref($location, prefix + path + postFix, ["form"]);
    };


    $scope.format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    var options = {
      readOnly: true,
      mode: {
        name: $scope.format
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.editLink = () => {
      var pageName = ($scope.directory) ? $scope.readMePath : $scope.pageId;
      return (pageName) ? Wiki.editLink($scope.branch, pageName, $location) : null;
    };

    $scope.historyLink = "#/wiki/history/" + $scope.pageId;

    $scope.$watch('workspace.tree', function () {
      if (!$scope.git && Git.getGitMBean(workspace)) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(updateView, 50);
      }
    });

    /*
    // TODO this doesn't work for some reason!
    $scope.$on('jmxTreeUpdated', function () {
      console.log("view: jmx tree updated!");
    });
    */

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    $scope.onSubmit = (json, form) => {
      notification("success", "Submitted form :" + form.get(0).name + " data: " + JSON.stringify(json));
    };

    $scope.onCancel = (form) => {
      notification("success", "Clicked cancel!");
    };


    $scope.onCreateDocumentSelect = (node) => {
      $scope.selectedCreateDocumentTemplate = node ? node.entity : null;
    };

    $scope.addAndCloseDialog = () => {
      var template = $scope.selectedCreateDocumentTemplate;
      if (template) {
        var exemplar = template.exemplar;
        console.log("Lets create an instance of template: " + exemplar);
      }
      $scope.addDialog.close();
    };

    updateView();

    function updateView() {
      var path = $location.path();
      if (path && path.startsWith("/wiki/diff")) {
        var baseObjectId = $routeParams["baseObjectId"];
        $scope.git = wikiRepository.diff($scope.objectId, baseObjectId, $scope.pageId, onFileDetails);
      } else {
        $scope.git = wikiRepository.getPage($scope.branch, $scope.pageId, $scope.objectId, onFileDetails);
      }
    }

    function viewContents(pageName, contents) {
      $scope.sourceView = null;
      if ("markdown" === $scope.format) {
        // lets convert it to HTML
        $scope.html = contents ? marked(contents) : "";
        $scope.html = $compile($scope.html)($scope);
      } else if ($scope.format && $scope.format.startsWith("html")) {
        $scope.html = contents;
        $compile($scope.html)($scope);
      } else {
        var form = null;
        if ($scope.format && $scope.format === "javascript") {
          form = $location.search()["form"];
        }
        $scope.source = contents;
        $scope.form = form;
        if (form) {
          // now lets try load the form JSON so we can then render the form
          $scope.sourceView = null;
          if (form === "/") {
            onFormSchema(_jsonSchema);
          } else {
            $scope.git = wikiRepository.getPage($scope.branch, form, $scope.objectId, (details) => {
              onFormSchema(Wiki.parseJson(details.text));
            });
          }
        } else {
          $scope.sourceView = "app/wiki/html/sourceView.html";
        }
      }
      Core.$apply($scope);
    }

    function onFormSchema(json) {
      $scope.formDefinition = json;
      if ($scope.source) {
        $scope.formEntity = Wiki.parseJson($scope.source);
      }
      $scope.sourceView = "app/wiki/html/formView.html";
      Core.$apply($scope);
    }

    function onFileDetails(details) {
      var contents = details.text;
      $scope.directory = details.directory;

      if (details && details.format) {
        $scope.format = details.format;
      } else {
        $scope.format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
      }
      $scope.codeMirrorOptions.mode.name = $scope.format;
      //console.log("format is '" + $scope.format + "'");

      $scope.children = details.children;
      if (!details.directory) {
        $scope.childen = null;
      }

      $scope.html = null;
      $scope.source = null;
      $scope.readMePath = null;

      if ($scope.children) {
        // if we have a readme then lets render it...
        var item = $scope.children.find((info) => {
          var name = (info.name || "").toLowerCase();
          var ext = fileExtension(name);
          return name && ext && (name.startsWith("readme.") || name === "readme");
        });
        if (item) {
          var pageName = item.path;
          $scope.readMePath = pageName;
          wikiRepository.getPage($scope.branch, pageName, $scope.objectId, (readmeDetails) => {
            viewContents(pageName, readmeDetails.text);
          });
        }
      } else {
        var pageName = $scope.pageId;
        viewContents(pageName, contents);
      }
      Core.$apply($scope);
    }
  }
}
