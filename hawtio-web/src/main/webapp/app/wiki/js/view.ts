module Wiki {
  export function ViewController($scope, $location, $routeParams,
                                      workspace:Workspace,
                                      marked,
                                      wikiRepository: GitWikiRepository) {

    $scope.pageId = $routeParams['page'];



    $scope.gridOptions = {
      data: 'children',
      columnDefs: [
        {
          field: 'name',
          displayName: 'Name',
          cellTemplate: '<div class="ngCellText"><a ng-href="#/wiki/view{{row.getProperty(' + "'path'" + ')}}{{hash}}">{{row.getProperty(col.field)}}</a></div>'
        },
        {
          field: 'lastModified',
          displayName: 'Modified'
        },
        {
          field: 'length',
          displayName: 'Size'
        }
      ]
    };




    wikiRepository.getPage($scope.pageId, (details) => {
      var contents = details.text;

      $scope.children = details.children;
      if (!details.directory) {
        $scope.childen = null;
      }

      var name = $scope.pageId;
      var extension = "";
      var idx = name.lastIndexOf(".");
      if (idx > 0) {
        extension = name.substring(idx + 1, name.length).toLowerCase();
      }

      if (extension.length === 0 || extension === "md" || extension === "markdown") {
        // lets convert it to HTML
        $scope.html = contents ? marked(contents) : "";

      } else {
        $scope.html = contents;
      }

      Core.$apply($scope);
    });

  }
}