module Dashboard {

  export function EditDashboardsController($scope, $routeParams, $route, $location, $rootScope, dashboardRepository:DefaultDashboardRepository, jolokia, workspace:Workspace) {

    $scope.hash = workspace.hash();
    $scope.selectedItems = [];
    $scope.repository = dashboardRepository;
    $scope.duplicateDashboards = new Core.Dialog();
    $scope.selectedProfilesDialog = [];
    $scope._dashboards = [];

    $rootScope.$on('dashboardsUpdated', dashboardLoaded);

    $scope.hasUrl = () => {
      return ($scope.url) ? true : false;
    };

    $scope.hasSelection = () => {
      return $scope.selectedItems.length !== 0;
    };

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      showFilter: false,
      showColumnMenu: false,
      filterOptions: {
        filterText: ''
      },
      data: '_dashboards',
      selectWithCheckboxOnly: true,
      showSelectionCheckbox: true,
      columnDefs: [
        {
          field: 'title',
          displayName: 'Dashboard',
          cellTemplate: '<div class="ngCellText"><a ng-href="#/dashboard/id/{{row.getProperty(' + "'id'" + ')}}{{hash}}"><editable-property class="inline-block" on-save="onDashRenamed(row.entity)" property="title" ng-model="row.entity"></editable-property></a></div>'
        },
        {
          field: 'group',
          displayName: 'Group'
        }
      ]
    };

    $scope.onDashRenamed = (dash) => {
      dashboardRepository.putDashboards([dash], "Renamed dashboard", (dashboards) => {
        dashboardLoaded(null, dashboards);
      });
    };

    // helpers so we can enable/disable parts of the UI depending on how
    // dashboard data is stored
    $scope.usingGit = () => {
      return dashboardRepository.getType() === 'git';
    };

    $scope.usingFabric = () => {
      return dashboardRepository.getType() === 'fabric';
    };

    $scope.usingLocal = () => {
      return dashboardRepository.getType() === 'container';
    };

    if ($scope.usingFabric()) {

      $scope.container = Fabric.getCurrentContainer(jolokia, ['versionId', 'profileIds']);

      $scope.gridOptions.columnDefs.add([{
        field: 'versionId',
        displayName: 'Version'
      }, {
        field: 'profileId',
        displayName: 'Profile'
      }, {
        field: 'fileName',
        displayName: 'File Name'
      }]);
    }


    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateData, 100);
    });


    $scope.goBack = () => {
      var href = Core.trimLeading($scope.url, "#");
      if (href) {
        $location.url(href);
      }
    };


    $scope.duplicateToProfiles = () => {
      if ($scope.hasSelection()) {
        $scope.duplicateDashboards.open();
      }
    };


    $scope.doDuplicateToProfiles = () => {
      $scope.duplicateDashboards.close();

      var newDashboards = [];

      $scope.selectedItems.forEach((dashboard) => {
        $scope.selectedProfilesDialog.forEach((profile) => {
          var newDash = dashboardRepository.cloneDashboard(dashboard);
          newDash['profileId'] = profile.id;
          newDash['title'] = dashboard.title;
          newDashboards.push(newDash);
        });
      });

      var commitMessage = "Duplicating " + $scope.selectedItems.length + " dashboards to " + $scope.selectedProfilesDialog.length + " profiles";

      dashboardRepository.putDashboards(newDashboards, commitMessage, (dashboards) => {
        dashboardLoaded(null, dashboards);
      });

    };

    $scope.addViewToDashboard = () => {
      var nextHref = null;
      angular.forEach($scope.selectedItems, (selectedItem) => {
        // TODO this could be a helper function
        var text = $scope.url;
        var query = null;
        if (text) {
          var idx = text.indexOf('?');
          if (idx && idx > 0) {
            query = text.substring(idx + 1);
            text = text.substring(0, idx);
          }
          text = Core.trimLeading(text, "#");
        }
        var search = {};
        if (query) {
          var expressions = query.split("&");
          angular.forEach(expressions, (expression) => {
            if (expression) {
              var names = expression.split("=");
              var key = names[0];
              var value = names.length > 1 ? names[1] : null;
              if (value) {
                value = encodeURIComponent(value);
              }
              var old = search[key];
              if (old) {
                if (!angular.isArray(old)) {
                  old = [old];
                  search[key] = old;
                }
                old.push(value);
              } else {
                search[key] = value;
              }
            }
          });
        }
        //console.log("path is: " + text + " the search is " + JSON.stringify(search));
        if ($route && $route.routes) {
          var value = $route.routes[text];
          if (value) {
            var templateUrl = value["templateUrl"];
            if (templateUrl) {
              if (!selectedItem.widgets) {
                selectedItem.widgets = [];
              }
              var nextNumber = selectedItem.widgets.length + 1;
              var widget = {
                id: "w" + nextNumber, title: "",
                row: 1,
                col: 1,
                size_x: 1,
                size_y: 1,
                path: Core.trimLeading(text, "/"),
                include: templateUrl,
                search: search,
                hash: ""
              };

              if ($scope.widgetTitle) {
                widget.title = $scope.widgetTitle;
              }

              // figure out the width of the dash
              var gridWidth = 0;

              selectedItem.widgets.forEach((w) => {
                var rightSide = w.col + w.size_x;
                if (rightSide > gridWidth) {
                  gridWidth = rightSide;
                }
              });

              if ($scope.preferredSize) {
                widget.size_x = parseInt($scope.preferredSize['size_x']);
                widget.size_y = parseInt($scope.preferredSize['size_y']);
              }

              var found = false;

              var left = (w) => {
                return w.col;
              };

              var right = (w)  => {
                return w.col + w.size_x - 1;
              };

              var top = (w) => {
                return w.row;
              };

              var bottom = (w) => {
                return w.row + w.size_y - 1;
              };

              var collision = (w1, w2) => {
                return !( left(w2) > right(w1) ||
                          right(w2) < left(w1) ||
                          top(w2) > bottom(w1) ||
                          bottom(w2) < top(w1));
              };

              if (selectedItem.widgets.isEmpty()) {
                found = true;
              }

              while (!found) {
                widget.col = 1;
                for (; (widget.col + widget.size_x) <= gridWidth; widget.col++) {
                  if (!selectedItem.widgets.any((w) => {
                    var c = collision(w, widget);
                    return c
                  })) {
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  widget.row = widget.row + 1
                }
                // just in case, keep the script from running away...
                if (widget.row > 50) {
                  found = true;
                }
              }

              if ($scope.routeParams) {
                widget['routeParams'] = $scope.routeParams;
              }
              selectedItem.widgets.push(widget);

              if (!nextHref && selectedItem.id) {
                nextHref = "/dashboard/id/" + selectedItem.id
              }

            }
          } else {
            // TODO we need to be able to match URI templates...
          }
        }
      });

      // now lets update the actual dashboard config
      var commitMessage = "Add widget";
      dashboardRepository.putDashboards($scope.selectedItems, commitMessage, function(dashboards) {
        if (nextHref) {
          // remove any dodgy query
          delete $location.search()["href"];
          $location.path(nextHref);
          Core.$apply($scope);
        }
      });

    };

    $scope.create = () => {
      var counter = dashboards().length + 1;
      var title = "Untitled" + counter;
      var newDash = dashboardRepository.createDashboard({title: title});

      dashboardRepository.putDashboards([newDash], "Created new dashboard: " + title, (dashboards) => {
        $scope.selectedItems.push(newDash);
        dashboardLoaded(null, dashboards);
      });

    };

    $scope.duplicate = () => {
      var newDashboards = [];
      var commitMessage = "Duplicated dashboard(s) ";
      angular.forEach($scope.selectedItems, (item, idx) => {
        // lets unselect this item
        var commitMessage = "Duplicated dashboard " + item.title;
        var newDash = dashboardRepository.cloneDashboard(item);
        newDashboards.push(newDash);
      });

      // let's just be safe and ensure there's no selections
      $scope.selectedItems = [];

      commitMessage = commitMessage + newDashboards.map((d) => { return d.title }).join(',');
      dashboardRepository.putDashboards(newDashboards, commitMessage, (dashboards) => {
        dashboardLoaded(null, dashboards);
      });
    };

    $scope.delete = () => {
      if ($scope.hasSelection()) {
        dashboardRepository.deleteDashboards($scope.selectedItems, (dashboards) => {
          $scope.selectedItems = [];
          dashboardLoaded(null, dashboards);
        });
      }
    };

    $scope.gist = () => {
      if ($scope.selectedItems.length > 0) {
        var id = $scope.selectedItems[0].id;
        $location.path("/dashboard/id/" + id + "/share");
      }
    };

    function updateData() {
      var url = $routeParams["href"];
      if (url) {
        $scope.url = decodeURIComponent(url);
      }

      var routeParams = $routeParams["routeParams"];
      if (routeParams) {
        $scope.routeParams = decodeURIComponent(routeParams);
      }
      var size:any = $routeParams["size"];
      if (size) {
        size = decodeURIComponent(size);
        $scope.preferredSize = angular.fromJson(size);
      }
      var title:any = $routeParams["title"];
      if (title) {
        title = decodeURIComponent(title);
        $scope.widgetTitle = title;
      }

      dashboardRepository.getDashboards((dashboards) => {
        dashboardLoaded(null, dashboards);
      });
    }

    function dashboardLoaded(event, dashboards) {
      $scope._dashboards = dashboards;
      if (event === null) {
        $scope.$emit('dashboardsUpdated', dashboards);
      }
      Core.$apply($scope);
    }

    function dashboards() {
      return $scope._dashboards;
    }

    updateData();

    /*
     // TODO for case where we navigate to the add view
     // for some reason the route update event isn't enough...
     // and we need to do this async to avoid the size calculation being wrong
     // bit of a hack - would love to remove! :)
     setTimeout(updateData, 100);
   */
  }
}
