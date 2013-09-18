module Fabric {

  export function ContainerController($scope, localStorage, $routeParams, jolokia, $location) {

    if ($scope.inDashboard) {
      $scope.operation = 'getContainer(java.lang.String, java.util.List)';
    } else {
      $scope.operation = 'getContainer(java.lang.String)';
    }

    /*
    // handy for working around any randomly added fields that won't marshal
    $scope.fields = jolokia.execute(Fabric.managerMBean, 'getFields(java.lang.String)', 'org.fusesource.fabric.api.Container');
    $scope.fields.remove('fabricService');
    $scope.operation = 'getContainer(java.lang.String, java.util.List)'
    */

    $scope.loading = true;

    $scope.containerId = $routeParams.containerId;

    $scope.addToDashboardLink = () => {
      var href = "#/fabric/container/:containerId";
      var routeParams = angular.toJson($routeParams);
      return "#/dashboard/add?tab=dashboard&href=" + encodeURIComponent(href) + "&routeParams=" + encodeURIComponent(routeParams);
    };

    $scope.selectedProfiles = [];
    $scope.selectedProfilesDialog = [];
    $scope.selectedProfilesString = '';

    $scope.userName = localStorage['fabric.userName'];
    // TODO at least obfusicate this
    $scope.password = localStorage['fabric.password'];

    $scope.addProfileDialog = new Core.Dialog();
    $scope.connectToContainerDialog = new Core.Dialog();
    $scope.deleteProfileDialog = new Core.Dialog();

    $scope.$watch('selectedProfiles', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.selectedProfilesString = '';
        $scope.selectedProfiles.each((p) => {
          $scope.selectedProfilesString += '<li>' + p.id + '</li>\n';
        });
      }
    }, true);

    $scope.doConnect = (container) => {
      $scope.connectToContainerDialog.open();
    };


    $scope.connect = () => {
      if ($scope.saveCredentials) {
        $scope.saveCredentials = false;
        localStorage['fabric.userName'] = $scope.userName;
        localStorage['fabric.password'] = $scope.password;
      }
      Fabric.connect(localStorage, $scope.row, $scope.userName, $scope.password, true);
      $scope.connectToContainerDialog.close();
    };

    $scope.stop = () => {
      doStopContainer($scope, jolokia, $scope.containerId);
    };

    $scope.delete = () => {
      // avoid any nasty errors that the container doesn't existing anymore
      Core.unregister(jolokia, $scope);
      doDeleteContainer($scope, jolokia, $scope.containerId, () => {
        $location.path('/fabric/containers');
      });
    };

    $scope.start = () => {
      doStartContainer($scope, jolokia, $scope.containerId);
    };

    $scope.statusIcon = () => {
      return Fabric.statusIcon($scope.row);
    };

    $scope.getType = () => {
      if ($scope.row) {
        if ($scope.row.ensembleServer) {
          return "Fabric Server";
        } else if ($scope.row.managed) {
          return "Managed Container";
        } else {
          return "Unmanaged Container";
        }
      }
      return "";
    };


    $scope.updateContainerProperty = (propertyName, row) => {
      setContainerProperty(jolokia, row.id, propertyName, row[propertyName], () => { $
        Core.$apply($scope); 
      }, (response) => {
        notification('error', 'Failed to set container property due to : ' + response.error);
        Core.$apply($scope); 
      });
    }


    $scope.getClass = (item) => {
      if (!$scope.provisionListFilter) {
        return 'no-filter';
      } else if (item.has($scope.provisionListFilter)) {
        return 'match-filter';
      } else {
        return 'no-match-filter';
      }
    }

    /*
    $scope.$watch('selectedProfilesDialog', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        console.log("Selected profiles: ", $scope.selectedProfilesDialog);
      }
    }, true);
    */

    $scope.addProfiles = () => {
      $scope.addProfileDialog.close();
      var addedProfiles = $scope.selectedProfilesDialog.map((p) => { return p.id });
      var text = Core.maybePlural(addedProfiles.length, "profile");
      addProfilesToContainer(jolokia, $scope.row.id, addedProfiles, () => {
        notification('success', "Successfully added " + text);
        $scope.selectedProfilesDialog = [];
        $scope.$broadcast('fabricProfileRefresh');
        Core.$apply($scope);
      }, (response) => {
        notification('error', "Failed to add " + text + " due to " + response.error);
        $scope.selectedProfilesDialog = [];
        Core.$apply($scope);
      });
    };

    $scope.getArguments = () => {
      if ($scope.inDashboard) {
        return [$scope.containerId, ['id', 'versionId', 'profileIds', 'provisionResult', 'jolokiaUrl', 'alive', 'jmxDomains', 'ensembleServer']];
      }
      return [$scope.containerId];
    };


    $scope.deleteProfiles = () => {
      $scope.deleteProfileDialog.close();
      var removedProfiles = $scope.selectedProfiles.map((p) => { return p.id });
      var text = Core.maybePlural(removedProfiles.length, "profile");
      removeProfilesFromContainer(jolokia, $scope.row.id, removedProfiles, () => {
        notification('success', "Successfully removed " + text);
        $scope.selectedProfiles = [];
        $scope.$broadcast('fabricProfileRefresh');
        Core.$apply($scope);
      }, (response) => {
        notification('error', "Failed to remove " + text + " due to " + response.error);
        $scope.selectedProfiles = [];
        Core.$apply($scope);
      });
    };

    $scope.$on("fabricProfileRefresh", () => {
      setTimeout( () => {
        jolokia.request({
              type: 'exec', mbean: Fabric.managerMBean,
              operation: $scope.operation,
              arguments: $scope.getArguments()
            },
            {
              method: 'POST',
              success: (response) => { render(response); }
            });
      }, 500);
    });


    if (angular.isDefined($scope.containerId)) {
      Core.register(jolokia, $scope, {
        type: 'exec', mbean: managerMBean,
        operation: $scope.operation,
        arguments: $scope.getArguments()
      }, onSuccess(render));
    }

    $scope.formatStackTrace = (exception) => {
      if (!exception) {
        return '';
      }
      var answer = '<ul class="unstyled">\n';
      exception.each((line) => {
        answer += "<li>" + Log.formatStackLine(line) + "</li>\n"
      });
      answer += "</ul>\n";
      return answer;
    }

    function render(response) {
      if (!angular.isDefined($scope.responseJson)) {
        $scope.loading = false;
      }
      var responseJson = angular.toJson(response.value);
      if ($scope.responseJson !== responseJson) {
        $scope.responseJson = responseJson;
        $scope.row = response.value;
        if ($scope.row) {
          if (angular.isDefined($scope.row.provisionException) && angular.isString($scope.row.provisionException)) {
            $scope.row.provisionExceptionArray = $scope.row.provisionException.lines();
          }
          $scope.services = getServiceList($scope.row);
          if (angular.isDefined($scope.resolverWatch) && angular.isFunction($scope.resolverWatch)) {
            $scope.resolverWatch();
          }
          $scope.resolverWatch = $scope.$watch('row.resolver', (newValue, oldValue) => {
            if (newValue !== oldValue) {
              $scope.updateContainerProperty('resolver', $scope.row);
            }
          });
        }
        Core.$apply($scope);
      }
    }

  }
}
