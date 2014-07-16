/// <reference path="../../baseHelpers.ts"/>
/// <reference path="fabricInterfaces.ts"/>
/// <reference path="fabricDialogs.ts"/>
/// <reference path="fabricGlobals.ts"/>
/// <reference path="jolokiaHelpers.ts"/>
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

  export function isCurrentContainer(container) {
    if (!container) {
      return false;
    }
    if (Core.isBlank(Fabric.currentContainerId)) {
      return false;
    }
    if (angular.isObject(container)) {
      return container['id'] === Fabric.currentContainerId;
    }
    if (angular.isString(container)) {
      return container === Fabric.currentContainerId;
    }

    return false;
  };

  export function canConnect(container) {
    if (!container) {
      return false;
    }
    if (Core.isBlank(container['jolokiaUrl'])) {
      return false;
    }

    if (!Core.parseBooleanValue(container['alive'])) {
      return false;
    }
    return true;
  };

  export function statusTitle(container) {
    var answer = 'Alive';
    if (!container.alive) {
      answer = 'Not Running';
    } else {
      answer += ' - ' + Core.humanizeValue(container.provisionResult);
    }
    return answer;
  }

  export function statusIcon(row:Fabric.Container) {
    if (row) {
      switch(row.provisionResult) {
        case 'success':
          if (row.alive) {
            return "green icon-play-circle";
          } else {
            return "orange icon-off";
          }
        case 'downloading':
          return "icon-download-alt";
        case 'installing':
          return "icon-hdd";
        case 'analyzing':
        case 'finalizing':
          return "icon-refresh icon-spin";
        case 'resolving':
          return "icon-sitemap";
        case 'error':
          return "red icon-warning-sign";
      }
      if (!row.alive) {
        return "orange icon-off";
      }
    }
    return "icon-refresh icon-spin";
  }

  export function gotoContainer($location, container:Fabric.Container) {
    $location.path('/fabric/container/' + container.id);
  }

  export function doDeleteContainer($scope, jolokia, name, onDelete:() => any = null) {
    Fabric.destroyContainer(jolokia, name, () => {
      if (onDelete) {
        onDelete();
      }
      Core.$apply($scope);
    });
  }

  export function doStartContainer($scope, jolokia, name) {
    if ($scope.fabricVerboseNotifications) {
      Core.notification('info', "Starting " + name);
    }
    Fabric.startContainer(jolokia, name, () => {
      Core.$apply($scope);
    });
  }

  export function doStopContainer($scope, jolokia, name) {
    if ($scope.fabricVerboseNotifications) {
      Core.notification('info', "Stopping " + name);
    }
    Fabric.stopContainer(jolokia, name, () => {
      Core.$apply($scope);
    });
  }

  export function stopContainers($scope, jolokia, c:Array<Fabric.Container>) {
    c.forEach((c) => doStopContainer($scope, jolokia, c.id));
  }

  export function startContainers($scope, jolokia, c:Array<Fabric.Container>) {
    c.forEach((c) => doStartContainer($scope, jolokia, c.id));
  }

  export function anyStartable(containers:Array<Fabric.Container>):boolean {
    return containers.length > 0 && containers.any((container:Fabric.Container) => {
      var answer = false;
      if (!container.alive) {
        answer = true;
        switch (container.provisionResult) {
          case 'downloading':
          case 'installing':
          case 'analyzing':
          case 'finalizing':
          case 'resolving':
            answer = false;
        }
      }
      return answer;
    });
  }

  export function anyStoppable(containers:Array<Fabric.Container>):boolean {
    return containers.length > 0 && containers.any((c:Fabric.Container) => c.alive === true);
  }

  export function allAlive(containers:Array<Fabric.Container>, state = true):boolean {
    return containers.length > 0 && containers.every((c:Fabric.Container) => c.alive === state);
  }

  export function decorate($scope, $location, jolokia) {
    if ($scope.containerHelpersAdded) {
      return;
    }
    $scope.containerHelpersAdded = true;
    $scope.isCurrentContainer = isCurrentContainer;
    $scope.canConnect = canConnect;
    $scope.getStatusTitle = statusTitle;
    $scope.showContainer = (container) => {
      gotoContainer($location, container);
    };
    $scope.statusIcon = statusIcon;
    $scope.everySelectionAlive = (state) => {
      return allAlive($scope.selectedContainers, state);
    }
    $scope.anySelectionStartable = () => {
      return anyStartable($scope.selectedContainers);
    }
    $scope.anySelectionStoppable = () => {
      return anyStoppable($scope.selectedContainers);
    }
    $scope.startContainer = (name) => {
      doStartContainer($scope, jolokia, name);
    }
    $scope.stopContainer = (name) => {
      doStopContainer($scope, jolokia, name);
    }
    $scope.startSelectedContainers = () => {
      startContainers($scope, jolokia, $scope.selectedContainers);
    }
    $scope.stopSelectedContainers = () => {
      stopContainers($scope, jolokia, $scope.selectedContainers);
    }
  }

}


