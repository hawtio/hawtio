module Fabric {

  export class ProfileSelector {

    public restrict = 'A';
    public replace = true;
    public templateUrl = Fabric.templatePath + "profileSelector.html";

    public scope = {
      selectedProfiles: '=fabricProfileSelector',
      versionId: '=',
      clearOnVersionChange: '@'
    };

    public controller = ($scope, $element, $attrs, jolokia) => {
      $scope.profiles = [];
      $scope.responseJson = '';
      $scope.filterText = '';
      $scope.clearOnVersionChange = false
      $scope.selectedAll = false;
      $scope.indeterminate = false;


      $scope.showProfile = (profile) => {
        return $scope.filterText.isBlank() || profile.id.has($scope.filterText);
      }


      $scope.render = (response) => {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson !== responseJson) {
          $scope.responseJson = responseJson;
          var selected = $scope.selectedProfiles;
          $scope.profiles = response.value.sortBy((profile) => { return profile.id; });
          selected.each((profile) => {
            var p = $scope.profiles.find((p) => { return p.id === profile.id; });
            if (profile) {
              p.selected = profile.selected;
            }
          });
          $scope.$apply();
        }
      }


      $scope.selected = () => {
        return $scope.profiles.filter((profile) => { return profile['selected']; });
      }

      $scope.selectAll = () => {
        $scope.profiles.each((profile) => { profile.selected = true; });
      }

      $scope.selectNone = () => {
        $scope.profiles.each((profile) => { delete profile.selected; });
      }


      $scope.$watch('selectedAll', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if ($scope.indeterminate) {
            $scope.selectNone();
          } else {
            if (newValue) {
              $scope.selectAll();
            } else {
              $scope.selectNone();
            }
          }
        }
      });

      $scope.$watch('profiles', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.selectedProfiles = $scope.selected();
        }
      }, true);


      $scope.init = () => {
        Core.unregister(jolokia, $scope);
        if( $scope.versionId !== '' ) {
          if ($scope.clearOnVersionChange) {
            $scope.selectNone();
          }
          Core.register(jolokia, $scope, {
            type: 'exec',
            mbean: managerMBean,
            operation: 'getProfiles(java.lang.String, java.util.List)',
            arguments: [$scope.versionId, ['id']]
          }, onSuccess($scope.render));
        }
      }


      $scope.$watch('versionId', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.init();
        }
      });

    };

    public link = ($scope, $element, $attrs) => {

      var selector = $element.find('#selector');

      $scope.$watch('indeterminate', (newValue, oldValue) => {
         if (newValue !== oldValue) {
           selector.prop('indeterminate', $scope.indeterminate);
         }
      });

      $scope.$watch('selectedProfiles', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if ($scope.selectedProfiles.length > 0) {
            if ($scope.selectedProfiles.length !== $scope.profiles.length) {
              $scope.indeterminate = true;
              $scope.selectedAll = false;
            } else {
              $scope.indeterminate = false;
              $scope.selectedAll = true;
            }
          } else {
            $scope.indeterminate = false;
            $scope.selectedAll = false;
          }
        }
      }, true);


    };
  }
}
