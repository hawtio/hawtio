/// <reference path="../../wiki/js/wikiHelpers.ts"/>
/// <reference path="fabricPlugin.ts"/>
module Fabric {
  _module.controller("Fabric.ClusterController", ["$scope", "$location", "$routeParams", "workspace", "jolokia", "$templateCache", ($scope, $location, $routeParams, workspace:Workspace, jolokia, $templateCache:ng.ITemplateCacheService) => {

    $scope.path = $routeParams["page"] || "/";
    if (!$scope.path.startsWith("/")) {
      $scope.path = "/" + $scope.path;
    }

    $scope.getIconClass = Wiki.iconClass;

    $scope.gridOptions = {
      data: 'children',
      displayFooter: false,
      sortInfo: { fields: ['name'], directions: ['asc'] },
      columnDefs: [
        {
          field: 'name',
          displayName: 'Name',
          cellTemplate: $templateCache.get('fileCellTemplate.html'),
          headerCellTemplate: $templateCache.get('fileColumnTemplate.html'),
          //cellTemplate: '<div class="ngCellText"><a href="{{childLink(row.entity)}}"><i class="{{row | fileIconClass}}"></i> {{row.getProperty(col.field)}}</a></div>',
          cellFilter: ""
        }
      ]
    };

    $scope.isTabActive = (href) => {
      var tidy = Core.trimLeading(href, "#");
      var loc = $location.path();
      return loc === tidy;
    };


    $scope.childLink = (child) => {
      var prefix = "#/fabric/clusters/" + Core.trimLeading($scope.path, "/") + "/";
      var postFix = "";
      var path = child.name;
      return Core.createHref($location, prefix + path + postFix);
    };

    $scope.$watch('workspace.tree', function () {
      setTimeout(updateView, 50);
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    updateView();

    function updateView() {
      loadBreadcrumbs();

      var mbean = Fabric.getZooKeeperFacadeMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, "read", $scope.path, onSuccess(onContents));
      }
    }

    function onContents(contents) {
      // for now it returns just lists of names
      $scope.children = [];
      $scope.stringData = null;
      $scope.html = null;
      if (contents) {
        angular.forEach(contents.children, (childName) => {
          $scope.children.push({ name: childName });
        });
        if (!$scope.children.length) {
          var stringData = contents.stringData;
          if (stringData) {
            $scope.stringData = stringData;
            var json = Core.tryParseJson(stringData);
            if (json) {
              $scope.html = Core.valueToHtml(json);
            } else {
              // TODO detect properties files
              $scope.html = stringData;
            }
          }
        }
      }
      Core.$apply($scope);
    }

    function loadBreadcrumbs() {
      var href = "#/fabric/clusters";
      $scope.breadcrumbs = [
        {href: href + "/", name: "/"}
      ];
      var path = $scope.path;
      var array = path ? path.split("/") : [];
      angular.forEach(array, (name) => {
        if (name) {
          if (!name.startsWith("/") && !href.endsWith("/")) {
            href += "/";
          }
          href += name;
          $scope.breadcrumbs.push({href: href, name: name});
        }
      });
    }
  }]);
}
