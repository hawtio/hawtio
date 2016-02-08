/**
 * @module Wiki
 */
/// <reference path="./wikiPlugin.ts"/>
module Wiki {

  _module.controller("Wiki.FormTableController", ["$scope", "$location", "$routeParams", "workspace", "wikiRepository", ($scope, $location, $routeParams, workspace:Workspace, wikiRepository:GitWikiRepository) => {
    Wiki.initScope($scope, $routeParams, $location);
    $scope.columnDefs = [];

    $scope.gridOptions = {
       data: 'list',
       displayFooter: false,
       showFilter: false,
       filterOptions: {
         filterText: ''
       },
       columnDefs: $scope.columnDefs
     };


    $scope.viewLink = (row) => {
      return childLink(row, "/view");
    };
    $scope.editLink = (row) => {
      return childLink(row, "/edit");
    };

    function childLink(child, prefix) {
      var start = Wiki.startLink($scope.branch);
      var childId = (child) ? child["_id"] || "" : "";
      return Core.createHref($location, start + prefix + "/" + $scope.pageId + "/" + childId);
    }

    var linksColumn = {
      field: '_id',
      displayName: 'Actions',
      cellTemplate: '<div class="ngCellText""><a ng-href="{{viewLink(row.entity)}}" class="btn">View</a> <a ng-href="{{editLink(row.entity)}}" class="btn">Edit</a></div>'
    };

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
      wikiRepository.getPage($scope.branch, form, $scope.objectId, onFormData);
    }

    updateView();

    function onResults(response) {
      var list = [];
      var map = Wiki.parseJson(response);
      angular.forEach(map, (value, key) => {
        value["_id"] = key;
        list.push(value);
      });
      $scope.list = list;
      Core.$apply($scope);
    }

    function updateView() {
      var filter = Core.pathGet($scope, ["gridOptions", "filterOptions", "filterText"]) || "";
      $scope.git = wikiRepository.jsonChildContents($scope.pageId, "*.json", filter, onResults);
    }

    function onFormData(details) {
      var text = details.text;
      if (text) {
        $scope.formDefinition = Wiki.parseJson(text);

        var columnDefs = [];
        var schema = $scope.formDefinition;
        angular.forEach(schema.properties, (property, name) => {
          if (name) {
            if (!Forms.isArrayOrNestedObject(property, schema)) {
              var colDef = {
                field: name,
                displayName: property.description || name,
                visible: true
              };
              columnDefs.push(colDef);
            }
          }
        });
        columnDefs.push(linksColumn);

        $scope.columnDefs = columnDefs;
        $scope.gridOptions.columnDefs = columnDefs;

        // now we have the grid column stuff loaded, lets load the datatable
        $scope.tableView = "app/wiki/html/formTableDatatable.html";
      }
    }
    Core.$apply($scope);
  }]);
}
