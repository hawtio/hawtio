/**
 * @module Maven
 */
module Maven {

  export function VersionsController($scope, $routeParams, workspace:Workspace, jolokia) {
    $scope.artifacts = [];
    $scope.group = $routeParams["group"] || "";
    $scope.artifact = $routeParams["artifact"] || "";
    $scope.version = "";
    $scope.classifier = $routeParams["classifier"] || "";
    $scope.packaging = $routeParams["packaging"] || "";

    var id = $scope.group + "/" + $scope.artifact;
    if ($scope.classifier) {
      id += "/" + $scope.classifier;
    }
    if ($scope.packaging) {
      id += "/" + $scope.packaging;
    }
    var columnTitle = id + " versions";

    var columnDefs:any[] = [
      {
        field: 'version',
        displayName: columnTitle,
        cellTemplate: '<div class="ngCellText"><a href="#/maven/artifact/{{row.entity.groupId}}/{{row.entity.artifactId}}/{{row.entity.version}}">{{row.entity.version}}</a></div>',
      }
    ];

    $scope.gridOptions = {
      data: 'artifacts',
      displayFooter: true,
      selectedItems: $scope.selected,
      selectWithCheckboxOnly: true,
      columnDefs: columnDefs,
      rowDetailTemplateId: "artifactDetailTemplate",

      sortInfo: { field: 'versionNumber', direction: 'DESC'},

      filterOptions: {
        filterText: 'search'
      }
    };

    addMavenFunctions($scope, workspace);

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      updateTableContents();
    });

    function updateTableContents() {
      var mbean = Maven.getMavenIndexerMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "versionComplete", $scope.group, $scope.artifact, $scope.version, $scope.packaging, $scope.classifier,
                onSuccess(render));
      } else {
        console.log("No MavenIndexerMBean!");
      }
    }

    function render(response) {
      $scope.artifacts = [];
      angular.forEach(response, (version) => {
        var versionNumberArray = Core.parseVersionNumbers(version);
        var versionNumber = 0;
        for (var i = 0; i <= 4; i++) {
          var num = (i >= versionNumberArray.length) ? 0 : versionNumberArray[i];
          versionNumber *= 1000;
          versionNumber += num;
        }

        $scope.artifacts.push({
          groupId: $scope.group,
          artifactId: $scope.artifact,
          packaging: $scope.packaging,
          classifier: $scope.classifier,
          version: version,
          versionNumber: versionNumber
        });
      });
      Core.$apply($scope);
    }
  }
}
