/**
 * @module Maven
 */
module Maven {

  export function SearchController($scope, $location, workspace:Workspace, jolokia) {

    var log:Logging.Logger = Logger.get("Maven");

    $scope.artifacts = [];
    $scope.selected = [];
    $scope.done = false;
    $scope.inProgress = false;
    $scope.form = {
      searchText: ""
    };
    $scope.search = "";
    $scope.searchForm = 'app/maven/html/searchForm.html';

    addMavenFunctions($scope, workspace);

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
        displayName: 'Version',
        cellTemplate: '<div class="ngCellText" title="Name: {{row.entity.name}}"><a ng-href="{{detailLink(row.entity)}}">{{row.entity.version}}</a</div>'
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

    $scope.hasAdvancedSearch = (form) => {
      return form.searchGroup || form.searchArtifact ||
              form.searchVersion || form.searchPackaging ||
              form.searchClassifier || form.searchClassName;
    };

    $scope.doSearch = () => {
      $scope.done = false;
      $scope.inProgress = true;
      $scope.artifacts = [];

      // ensure ui is updated with search in progress...
      setTimeout( () => {
        Core.$apply($scope)
      }, 50);

      var mbean = Maven.getMavenIndexerMBean(workspace);
      var form = $scope.form;
      if (mbean) {
        var searchText = form.searchText;
        var kind = form.artifactType;
        if (kind) {
          if (kind === "className") {
            log.debug("Search for: " + form.searchText + " className");
            jolokia.execute(mbean, "searchClasses", searchText, onSuccess(render));
          } else {
            var paths = kind.split('/');
            var packaging = paths[0];
            var classifier = paths[1];
            log.debug("Search for: " + form.searchText + " packaging " + packaging + " classifier " + classifier);
            jolokia.execute(mbean, "searchTextAndPackaging", searchText, packaging, classifier, onSuccess(render));
          }
        } else if (searchText) {
          log.debug("Search text is: " + form.searchText);
          jolokia.execute(mbean, "searchText", form.searchText, onSuccess(render));
        } else if ($scope.hasAdvancedSearch(form)) {
          log.debug("Searching for " +
                  form.searchGroup + "/" + form.searchArtifact + "/" +
                  form.searchVersion + "/" + form.searchPackaging + "/" +
                  form.searchClassifier + "/" + form.searchClassName);

          jolokia.execute(mbean, "search",
                  form.searchGroup || "", form.searchArtifact || "", form.searchVersion || "",
                  form.searchPackaging || "", form.searchClassifier || "", form.searchClassName || "",
                  onSuccess(render));
        }
      } else {
        notification("error", "Cannot find the Maven Indexer MBean!");
      }
    };

    var RESPONSE_LIMIT = 50;

    function render(response) {
      log.debug("Search done, preparing result.");
      $scope.done = true;
      $scope.inProgress = false;
      // let's limit the reponse to avoid blowing up
      // the browser until we start using a widget
      // that supports pagination
      if (response.length > RESPONSE_LIMIT) {
        $scope.tooManyResponses = "This search returned " + response.length + " artifacts, showing the first " + RESPONSE_LIMIT + ", please refine your search";
      } else {
        $scope.tooManyResponses = "";
      }
      $scope.artifacts = response.first(RESPONSE_LIMIT);

      Core.$apply($scope);
    }
  }
}
