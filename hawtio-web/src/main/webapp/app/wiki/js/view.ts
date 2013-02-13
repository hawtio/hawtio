module Wiki {

  export function ViewController($scope, $location, $routeParams,
                                      workspace:Workspace,
                                      marked, fileExtensionTypeRegistry,
                                      wikiRepository: GitWikiRepository) {

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


    wikiRepository.getPage($scope.pageId, (details) => {
      var contents = details.text;

      $scope.children = details.children;
      if (!details.directory) {
        $scope.childen = null;
      }

      var format = Wiki.fileFormat($scope.pageId, fileExtensionTypeRegistry);
      if ("markdown" === format) {
        // lets convert it to HTML
        $scope.html = contents ? marked(contents) : "";
      } else if (format && format.startsWith("html")) {
        $scope.html = contents
      } else {
        $scope.source = contents;
      }
      Core.$apply($scope);
    });
  }
}