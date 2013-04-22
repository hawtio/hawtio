module Fabric {

  export function ClusterController($scope, $location, $routeParams, workspace:Workspace, jolokia) {

    $scope.path = $routeParams["page"] || "/";

    $scope.gridOptions = {
      data: 'children',
      displayFooter: false,
      columnDefs: [
        {
          field: 'name',
          displayName: 'Name',
          cellTemplate: '<div class="ngCellText"><a href="{{childLink(row.entity)}}"><i class="{{row | fileIconClass}}"></i> {{row.getProperty(col.field)}}</a></div>',
          cellFilter: ""
        }
      ]
    };

    $scope.isTabActive = (href) => {
      var tidy = Core.trimLeading(href, "#");
      var loc = $location.path();
      if (loc === tidy) return true;
      return false;
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
      if (contents) {
        angular.forEach(contents.children, (childName) => {
          $scope.children.push({ name: childName });
        });
      } else {
        console.log("no contents for " + $scope.path);
      }
      // $scope.sourceView = "app/wiki/html/sourceView.html";
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
  }
}
