module Wiki {

  export function ViewController($scope, $location, $routeParams, workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository) {

    $scope.pageId = Wiki.pageId($routeParams, $location);

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

    var format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
    var options = {
      mode: {
        name: format
      },
      readOnly: true
    };
    $scope.codeMirrorOptions = CodeEditor.createEditorSettings(options);

    $scope.editLink = () => {
      var pageName = ($scope.directory) ? $scope.readMePath : Wiki.pageId($routeParams, $location);
      return (pageName) ? Wiki.editLink(pageName, $location) : null;
    };

    function viewContents(pageName, contents) {
      var format = Wiki.fileFormat(pageName, fileExtensionTypeRegistry);
      if ("markdown" === format) {
        // lets convert it to HTML
        $scope.html = contents ? marked(contents) : "";
      } else if (format && format.startsWith("html")) {
        $scope.html = contents
      } else {
        $scope.source = contents;
      }
      Core.$apply($scope);
    }

    wikiRepository.getPage($scope.pageId, (details) => {
      var contents = details.text;
      $scope.directory = details.directory;

      $scope.children = details.children;
      if (!details.directory) {
        $scope.childen = null;
      }

      if ($scope.children) {
        $scope.html = null;
        $scope.source = null;
        $scope.readMePath = null;

        // if we have a readme then lets render it...
        var item = $scope.children.find((info) => {
          var name = (info.name || "").toLowerCase();
          var ext = fileExtension(name);
          return name && ext && (name.startsWith("readme.") || name === "readme");
        });
        if (item) {
          var pageName = item.path;
          $scope.readMePath = pageName;
          wikiRepository.getPage(pageName, (readmeDetails) => {
            viewContents(pageName, readmeDetails.text);
          });
        }
      } else {
        var pageName = $scope.pageId;
        viewContents(pageName, contents);
      }
      Core.$apply($scope);
    });
  }
}