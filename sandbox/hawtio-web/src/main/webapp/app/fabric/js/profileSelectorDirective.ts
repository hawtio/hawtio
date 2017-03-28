/// <reference path="fabricPlugin.ts"/>
module Fabric {

  export class ProfileSelector {

    public restrict = 'A';
    public replace = true;
    public templateUrl = Fabric.templatePath + "profileSelector.html";

    public scope = {
      selectedProfiles: '=fabricProfileSelector',
      versionId: '=',
      filterWatch: '@',
      selectedWatch: '@',
      clearOnVersionChange: '@',
      noLinks: '@',
      showHeader: '@',
      useCircles: '@',
      expanded: '@',
      excludedProfiles: '=',
      includedProfiles: '='
    };

    public controller = ["$scope", "$element", "$attrs", "workspace", "jolokia", "localStorage", "$location", ($scope, $element, $attrs, workspace, jolokia, localStorage, $location) => {
      $scope.profiles = [];
      $scope.responseJson = '';
      $scope.filterText = '';
      $scope.clearOnVersionChange = false;
      $scope.noLinks = false;
      $scope.selectedAll = false;
      $scope.indeterminate = false;
      $scope.showFilter = true;
      $scope.useCircles = false;
      $scope.expanded = false;
      $scope.tree = [];

      $scope.showProfile = (profile) => {
        return Core.matchFilterIgnoreCase(profile.id, $scope.filterText);
      };

      $scope.showBranch = (branch) => {
        return $scope.filterText.isBlank() ||
               branch.profiles.some((profile) => {
                 return Core.matchFilterIgnoreCase(profile.id, $scope.filterText)
               });
      };

      $scope.goto = (profile) => {
        Fabric.gotoProfile(workspace, jolokia, localStorage, $location, $scope.versionId, profile);
      };


      $scope.render = (response) => {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson !== responseJson) {
          $scope.responseJson = responseJson;
          var selected = $scope.selectedProfiles;
          $scope.profiles = response.value.sortBy((profile) => { return profile.id; });
          angular.forEach(selected, (profile) => {
            var p = $scope.profiles.find((p) => { return p.id === profile.id; });
            if (p && profile) {
              p.selected = profile.selected;
            }
          });

          $scope.profiles = $scope.profiles.exclude((p) => { return p.hidden; });

          if ($scope.excludedProfiles) {
            $scope.profiles = $scope.excluded();
          }

          if ($scope.includedProfiles) {
            $scope.profiles = $scope.included();
          }

          var paths = [];

          $scope.profiles.each((profile) => {
            var path = profile.id.split('-');
            profile.name = path.last();
            profile.path = path.exclude(profile.name).join(' / ');
            paths.push(profile.path);
          });

          paths = paths.unique().sortBy('length').sortBy((n) => { return n; });
          var tree = [];
          paths.forEach((path) => {
            var branch = {
              expanded: $scope.expanded,
              path: path,
              profiles: $scope.profiles.filter((profile) => { return profile.path === path; })
            };
            tree.push(branch);
          });
          $scope.tree = tree;

          Core.$apply($scope);
        }
      };

      $scope.excluded = () => {
        return $scope.profiles.exclude((p) => { return $scope.excludedProfiles.some((e) => { return e === p.id; })});
      };

      $scope.included = () => {
        return $scope.profiles.exclude((p) => { return $scope.includedProfiles.none((e) => { return e === p.id; })});
      };


      $scope.isOpen = (branch) => {
        if ($scope.filterText !== '') {
          return "opened";
        }
        if (branch.expanded) {
          return "opened";
        }
        return "closed";
      };


      $scope.isOpenIcon = (branch) => {
        if (branch.expanded) {
          return "icon-folder-open";
        }
        return "icon-folder-closed";
      };


      $scope.$watch('includedProfiles', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.init();
        }
      }, true);

      $scope.$watch('excludedProfiles', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.init();
        }
      }, true);


      $scope.abstract = () => {
        return $scope.profiles.filter((profile) => { return profile['abstract']; });
      };

      $scope.selected = () => {
        return $scope.profiles.filter((profile) => { return profile['selected']; });
      };

      $scope.selectAll = () => {
        $scope.profiles.each((profile) => { profile.selected = true; });
      };

      $scope.selectNone = () => {
        $scope.profiles.each((profile) => { delete profile.selected; });
      };

      $scope.$parent.profileSelectAll = $scope.selectAll;
      $scope.$parent.profileSelectNone = $scope.selectNone;


      $scope.getSelectedClass = (profile) => {
        if (profile.abstract) {
          return "abstract";
        }
        if (profile.selected) {
          return "selected";
        }
        return "";
      };


      $scope.$watch('selectedAll', (newValue, oldValue) => {
        if (!$scope.indeterminate && newValue !== oldValue) {
          if (newValue) {
            $scope.selectAll();
          } else {
            $scope.selectNone();
          }
        }
      });

      $scope.$watch('profiles', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          $scope.selectedProfiles = $scope.selected();
        }
      }, true);


      $scope.$on("fabricProfileRefresh", () => {
        if ($scope.versionId) {
          jolokia.request({
            type: 'exec', mbean: Fabric.managerMBean,
            operation: 'getProfiles(java.lang.String, java.util.List)',
            arguments: [$scope.versionId, ['id', 'hidden']]
          },
          {
            method: 'POST',
            success: (response) => { $scope.render(response); }
          });
        }
      });


      $scope.init = () => {
        log.debug("Initializing profile selector, version: ", $scope.versionId);
        $scope.responseJson = null;
        Core.unregister(jolokia, $scope);
        if( $scope.versionId !== '' ) {
          if ($scope.clearOnVersionChange) {
            $scope.selectNone();
          }
          if ($scope.versionId) {
            Core.register(jolokia, $scope, {
              type: 'exec',
              mbean: managerMBean,
              operation: 'getProfiles(java.lang.String, java.util.List)',
              arguments: [$scope.versionId, ['id', 'hidden', 'abstract']]
            }, onSuccess($scope.render, {
              error: (response) => {
                // TODO somewhere this directive is kinda getting leaked, need to track down
                log.debug("Error fetching profiles: ", response.error, " unregistering poller");
                Core.unregister(jolokia, $scope);
              }
            }));
          }
        }
      };


      $scope.$watch('versionId', (newValue, oldValue) => {
        log.debug("versionId, newValue: ", newValue, " oldValue: ", oldValue);
        if ($scope.versionId && $scope.versionId !== '') {
          log.debug("Unregistering old poller");
          Core.unregister(jolokia, $scope);
          jolokia.request({
            type: 'exec',
            mbean: Fabric.managerMBean,
            operation: 'versions()',
            arguments: []
          }, {
            method: 'POST',
            success: (response) => {
              if (response.value.some((version) => {
                return version.id === newValue;
              })) {
                log.debug("registering new poller");
                $scope.init();
                Core.$apply($scope);
              }
            },
            error: (response) => {
              Core.$apply($scope);
            }
          });
        }
      });

    }];


    public link = ($scope, $element, $attrs) => {

      var selector = $element.find('#selector');

      if (!angular.isDefined($attrs['showHeader'])) {
        $scope.showFilter = true;
      } else {
        $scope.showFilter = $attrs['showHeader'];
      }

      if (angular.isDefined($attrs['filterWatch'])) {
        $scope.$parent.$watch($attrs['filterWatch'], (newValue, oldValue) => {
          if (newValue !== oldValue) {
            $scope.filterText = newValue;
          }
        });
      }

      $scope.$watch('indeterminate', (newValue, oldValue) => {
         if (newValue !== oldValue) {
           selector.prop('indeterminate', $scope.indeterminate);
         }
      });

      $scope.$watch('selectedProfiles', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          oldValue.each((profile) => {
            var match = $scope.profiles.find((p) => p.id == profile.id);
            if (match !== undefined ) {
              match.selected = false;
            }
          })
          newValue.each((profile) => {
            var match =  $scope.profiles.find((p) => p.id == profile.id );
            if (match !== undefined ) {
              match.selected = true;
            }
          })
          if ($scope.selectedProfiles.length > 0) {
            if ($scope.selectedProfiles.length !== $scope.profiles.length) {
              $scope.indeterminate = true;
              $scope.selectedAll = false;

              $scope.$parent.profileSomeSelected = true;
              $scope.$parent.profileNoneSelected = false;
              $scope.$parent.profileAllSelected = false;
            } else {
              $scope.indeterminate = false;
              $scope.selectedAll = true;

              $scope.$parent.profileSomeSelected = false;
              $scope.$parent.profileNoneSelected = false;
              $scope.$parent.profileAllSelected = true;

            }
          } else {
            $scope.indeterminate = false;
            $scope.selectedAll = false;

            $scope.$parent.profileSomeSelected = false;
            $scope.$parent.profileNoneSelected = true;
            $scope.$parent.profileAllSelected = false;

          }
        }
      }, true);
    };
  }
}
