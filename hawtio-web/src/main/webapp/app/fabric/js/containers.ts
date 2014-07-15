/// <reference path="fabricPlugin.ts"/>
/// <reference path="fabricInterfaces.ts"/>
module Fabric {

  _module.controller("Fabric.ContainersController", ["$scope", "$location", "$route", "jolokia", "workspace", "$dialog", ($scope, $location, $route, jolokia, workspace, $dialog) => {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.selectedContainers = <Array<Container>>[];
    $scope.createLocationDialog = Fabric.getCreateLocationDialog($dialog, <CreateLocationDialogOptions>{ 
      selectedContainers: () => { 
        return $scope.selectedContainers; 
      },
      callbacks: () => { 
        return <JolokiaCallbacks>{
          success: (response) => {
            Core.$apply($scope);
          },
          error: (response) => {
            Core.$apply($scope);
          }
        };
      }
    });

    // bind model values to search params...
    Core.bindModelToSearchParam($scope, $location, "containerIdFilter", "q", "");

    // only reload the page if certain search parameters change
    Core.reloadWhenParametersChange($route, $scope, $location);

    $scope.locationMenu = {
      icon: 'icon-beer',
      title: 'Set Location',
      items: []
    };

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
            $scope.createLocationDialog.open();
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
