module Wiki {

  export function FormTableController($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) {
    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.columnDefs = [];
    $scope.searchText = null;

    $scope.$watch('workspace.tree', function () {
      if (!$scope.git && Git.getGitMBean(workspace)) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(updateView, 50);
      }
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    var form = $location.search()["form"];
    if (form) {
      wikiRepository.getPage(form, $scope.objectId, onFormData);
    }

    updateView();

    function onResults(response) {
      $scope.list = Wiki.parseJson(response);
      Core.$apply($scope);
    }

    function updateView() {
      $scope.git = wikiRepository.jsonChildContents($scope.pageId, "*.json", $scope.searchText, onResults);
    }

    function onFormData(details) {
      var text = details.text;
      if (text) {
        $scope.formDefinition = Wiki.parseJson(text);

        var columnDefs = [];
        angular.forEach($scope.formDefinition.args, (property) => {
          var name = property.name;
          if (name) {
            var colDef = {
              field: name,
              displayName: property.desc || name,
              visible: true
            };
            columnDefs.push(colDef);
          }
        });

        //$scope.gridOptions.columDefs = columnDefs;
        $scope.gridOptions = {
          data: 'list',
          displayFooter: false,
          showFilter: false,
          filterOptions: {
            filterText: "searchText"
          },
          columnDefs: columnDefs
        };

        // now we have the grid column stuff loaded, lets load the datatable
        $scope.tableView = "app/wiki/html/formTableDatatable.html";
      }
    }
    Core.$apply($scope);
  }
}
