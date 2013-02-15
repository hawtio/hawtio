module Wiki {

  export function ViewController($scope, $location, $routeParams, workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository) {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.objectId = $routeParams["objectId"];

    $scope.gridOptions = {
      data: 'children',
      displayFooter: false,
      columnDefs: [
        {
          field: 'name',
          displayName: 'Page Name',
          cellTemplate: '<div class="ngCellText"><a ng-href="#/wiki/view{{row.getProperty(' + "'path'" + ')}}{{hash}}"><i class="{{row | fileIconClass}}"></i> {{row.getProperty(col.field)}}</a></div>',
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

    updateView();

    var format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    var options = {
      readOnly: true,
      mode: {
        name: format
      }
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.editLink = () => {
      var pageName = ($scope.directory) ? $scope.readMePath : $scope.pageId;
      return (pageName) ? Wiki.editLink(pageName, $location) : null;
    };

    $scope.historyLink = "#/wiki/history/" + $scope.pageId;


    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    function viewContents(pageName, contents) {
      console.log("format is '" + format + "'");
      $scope.sourceView = null;
      if ("markdown" === format) {
        // lets convert it to HTML
        $scope.html = contents ? marked(contents) : "";
      } else if (format && format.startsWith("html")) {
        $scope.html = contents
      } else {
        $scope.source = contents;
        $scope.sourceView = "app/wiki/html/sourceView.html";
      }
      Core.$apply($scope);
    }

    function updateView() {
      wikiRepository.getPage($scope.pageId, $scope.objectId, onFileDetails);
    }

    function onFileDetails(details) {
      var contents = details.text;
      $scope.directory = details.directory;

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
          wikiRepository.getPage(pageName, $scope.objectId, (readmeDetails) => {
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