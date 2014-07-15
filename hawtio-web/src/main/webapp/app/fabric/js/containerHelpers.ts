/// <reference path="../../baseHelpers.ts"/>
/// <reference path="fabricHelpers.ts"/>
/// <reference path="fabricInterfaces.ts"/>
/// <reference path="fabricDialogs.ts"/>
/// <reference path="../../ui/js/dropDown.ts"/>
module ContainerHelpers {

  export var NO_LOCATION = "No Location";

  /**
   * Builds a string array of locations from an array of containers
   */
  export function extractLocations(containers:Array<Fabric.Container>):Array<string> {
    var locations = <Array<string>>containers.map((container) => {
      if (Core.isBlank(container['location'])) {
        return NO_LOCATION;
      } else {
        return container['location'];
      }
    });
    locations.push(NO_LOCATION);
    locations = locations.unique().sortBy('');
    locations = <Array<string>>locations.exclude((location) => {
      return Core.isBlank(location);
    });
    return locations;
  }

  export interface WithSelectedContainers {
    selectedContainers: Array<Fabric.Container>;
  }

  export function getCreateLocationDialog($scope:WithSelectedContainers, $dialog):any {
    return Fabric.getCreateLocationDialog($dialog, <Fabric.CreateLocationDialogOptions>{ 
      selectedContainers: () => { 
        return $scope.selectedContainers; 
      },
      callbacks: () => { 
        return <Fabric.JolokiaCallbacks>{
          success: (response) => {
            Core.$apply(<any>$scope);
          },
          error: (response) => {
            Core.$apply(<any>$scope);
          }
        };
      }
    });
  }

  /**
   * Interface that describes the required members on a scope passed into 'buildLocationMenu'
   */
  export interface WithCreateLocationDialog extends WithSelectedContainers {
    selectedContainers: Array<Fabric.Container>;
    createLocationDialog: any;
  }

  /**
   * Builds a UI.MenuItem from an array of locations, menu items contain actions to apply the selected menu item onto the selected containers
   */
  export function buildLocationMenu($scope:WithCreateLocationDialog, jolokia, locations:Array<string>):UI.MenuItem {
    var locationMenu = <UI.MenuItem>{
      icon: 'icon-beer',
      title: 'Set Location',
      items: []
    };
    var menuItems = <Array<UI.MenuItem>>[];
    locations.forEach((location) => {
      menuItems.push(<UI.MenuItem>{
        title: location,
        action: () => {
          $scope.selectedContainers.forEach((container:Fabric.Container) => {
            var arg = location;
            if (arg === NO_LOCATION) {
              arg = "";
            }
            Fabric.setContainerProperty(jolokia, container.id, 'location', arg, () => {
                Core.$apply(<any>$scope);
              }, () => {
                Core.$apply(<any>$scope);
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
    locationMenu.items = menuItems;
    return locationMenu
  }

}


