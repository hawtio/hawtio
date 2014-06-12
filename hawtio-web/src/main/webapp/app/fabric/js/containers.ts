/// <reference path="fabricPlugin.ts"/>
module Fabric {

  _module.controller("Fabric.ContainersController", ["$scope", "$location", "$route", "jolokia", "workspace", ($scope, $location, $route, jolokia, workspace) => {

    Fabric.initScope($scope, $location, jolokia, workspace);

    // bind model values to search params...
    Core.bindModelToSearchParam($scope, $location, "containerIdFilter", "q", "");

    // only reload the page if certain search parameters change
    Core.reloadWhenParametersChange($route, $scope, $location);

    $scope.locationMenu = {
      icon: 'icon-beer',
      title: 'Set Location',
      items: []
    };

    $scope.noLocation = "(No Location)";
    $scope.newLocationDialog = {
      dialog: new UI.Dialog(),
      onOk: () => {
        $scope.newLocationDialog.close();
        $scope.selectedContainers.each((container) => {
          Fabric.setContainerProperty(jolokia, container.id, 'location', $scope.newLocationName, () => {
              Core.$apply($scope);
            }, () => {
              Core.$apply($scope);
            });
        });
      },
      open: () => {
        $scope.newLocationDialog.dialog.open();
      },
      close: () => {
        $scope.newLocationDialog.dialog.close();
      }
    };
    $scope.newLocationName = "";

    $scope.addToDashboardLink = () => {
      var href = "#/fabric/containers";
      var title = "Containers";
      var size = angular.toJson({size_y:1, size_x: 4});

      return "#/dashboard/add?tab=dashboard" +
          "&href=" + encodeURIComponent(href) +
          "&size=" + encodeURIComponent(size) +
          "&title=" + encodeURIComponent(title);
    };

    $scope.$watch('containers', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        $scope.selectedContainers = $scope.containers.filter((c) => { return c.selected; });

        var menuItems = [];

        var locations = $scope.containers.map((container) => {
          if (Core.isBlank(container['location'])) {
            return $scope.noLocation;
          } else {
            return container['location'];
          }
        });
        locations.push($scope.noLocation);
        locations = locations.unique().sortBy();
        locations = locations.exclude((location) => {
          return Core.isBlank(location);
        });

        locations.forEach((location) => {
          menuItems.push({
            title: location,
            action: () => {
              $scope.selectedContainers.each((container) => {
                var arg = location;
                if (arg === $scope.noLocation) {
                  arg = "";
                }
                Fabric.setContainerProperty(jolokia, container.id, 'location', arg, () => {
                    Core.$apply($scope);
                  }, () => {
                    Core.$apply($scope);
                  });
              });
            }
          });
        });

        menuItems.push({
          title: "New...",
          action: () => {
            $scope.newLocationName = "";
            $scope.newLocationDialog.open();
          }
        });

        $scope.locationMenu.items = menuItems;

        if ($scope.selectedContainers.length > 0) {
          $scope.activeContainerId = '';
        }
      }
    }, true);
  }]);
}
