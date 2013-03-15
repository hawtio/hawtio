module Maven {

  export function SearchController($scope, $location, workspace:Workspace, jolokia) {
    $scope.artifacts = [];
    $scope.selected = [];
    $scope.searchText = "";
    $scope.search = "";

    var columnDefs:any[] = [
      {
        field: 'groupId',
        displayName: 'Group'
      },
      {
        field: 'artifactId',
        displayName: 'Artifact',
        cellTemplate: '<div class="ngCellText" title="Name: {{row.entity.name}}">{{row.entity.artifactId}}</div>'
      },
      {
        field: 'version',
        displayName: 'Version'
      }
    ];

    $scope.gridOptions = {
      data: 'artifacts',
      displayFooter: true,
      selectedItems: $scope.selected,
      selectWithCheckboxOnly: true,
      columnDefs: columnDefs,
      rowDetailTemplateId: "artifactDetailTemplate",

      filterOptions: {
        filterText: 'search'
      }

    };

    $scope.doSearch = () => {
      var mbean = Maven.getMavenIndexerMBean(workspace);
      console.log("Searching for " + $scope.searchText);
      if (mbean && $scope.searchText) {
          jolokia.execute(mbean, "searchText", $scope.searchText, onSuccess(render));
        } else {
          notification("error", "Could not find the Maven Indexer MBean!");
        }
    };

    function render(response) {
      $scope.artifacts = response;
      Core.$apply($scope);
    }
  }
}
