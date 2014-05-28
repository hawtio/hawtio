module Fabric {

  export class ContainerList {

    public restrict = 'A';
    public replace = true;
    public templateUrl = Fabric.templatePath + "containerList.html";

    public scope = false;

    public controller($scope, $element, $attrs, jolokia, $location, workspace, $templateCache) {

      $scope.containerArgs = ["id", "alive", "parentId", "profileIds", "versionId", "provisionResult", "jolokiaUrl", "root", 'jmxDomains', "type", "metadata", "location"];
      $scope.profileFields = ["id", "hidden"];
      $scope.containersOp = 'containers(java.util.List, java.util.List)';
      $scope.ensembleContainerIdListOp = 'EnsembleContainers';

      $scope.containers = [];
      $scope.activeProfiles = [];
      $scope.selectedContainers = [];
      $scope.selectedContainerIds = [];
      $scope.showSelect = true;
      $scope.requirements = null;

      Fabric.initScope($scope, $location, jolokia, workspace);

      $scope.currentPage = $templateCache.get("addProfileRequirements");

      // for editing container requirements
      $scope.editRequirements = {
        dialog:  new UI.Dialog(),

        excludeProfiles: [],
        selectedProfiles: [],

        excludeDependentProfiles: [],
        selectedDependentProfiles: [],

        addDependentProfileDialog:  new UI.Dialog(),
        versionId: null,
        addProfileSelectShow: false,

        dialogOpen: (profile) => {
          // lets make sure the requirements are pre-populated with values
          var editRequirementsEntity = {
            profileRequirements: []
          };
          // initially the requirements stored in ZK look like this:
          // > zk:get /fabric/configs/io.fabric8.requirements.json
          // {"profileRequirements":[],"version":"1.0"}
          if ($scope.requirements) {
            angular.copy($scope.requirements, editRequirementsEntity);
          }
          var profileRequirements = editRequirementsEntity.profileRequirements;
          if (profileRequirements) {
            angular.forEach($scope.activeProfiles, (profile) => {
              var currentRequirements = profile.requirements;
              if (!currentRequirements) {
                currentRequirements = {
                  profile: profile.id
                };
                profile.requirements = currentRequirements;
              }
              if (!profileRequirements.find((p) => { return p.profile === currentRequirements.profile })) {
                profileRequirements.push(currentRequirements);
              }
            });
          }
          if (!profile && $scope.activeProfiles.length) {
            // lets pick the first one - its just to default a version
            profile = $scope.activeProfiles[0];
          }
          if (profile) {
            $scope.editRequirements.versionId = profile.versionId;
          }
          $scope.editRequirements.entity = editRequirementsEntity;
          $scope.editRequirements.dialog.open();
        },

        // show / hide the new dependent profiles on a profile requirement
        addDependentProfileDialogOpen: (requirement) => {
          $scope.editRequirements.addDependentProfileDialogProfile = requirement.profile;
          $scope.editRequirements.selectedDependentProfiles.splice(0, $scope.editRequirements.selectedDependentProfiles.length);
          $scope.editRequirements.excludeDependentProfiles = [requirement.profile].concat(requirement.dependentProfiles || []);
          $scope.editRequirements.addDependentProfilesToRequirement = requirement;
          $scope.editRequirements.addDependentProfileDialogShow = true;
        },

        addDependentProfileDialogHide: () => {
          $scope.editRequirements.addDependentProfileDialogShow = false;
        },

        addDependentProfileDialogApply: () => {
          var requirement = $scope.editRequirements.addDependentProfilesToRequirement;
          angular.forEach($scope.editRequirements.selectedDependentProfiles, (profile) => {
            var id = profile.id;
            if (id && requirement) {
              if (!requirement.dependentProfiles) requirement.dependentProfiles = [];
              if (!requirement.dependentProfiles.find((el) => { return el === id })) {
                requirement.dependentProfiles.push(id);
              }
            }
          });
          $scope.editRequirements.addDependentProfileDialogHide();
        },

        // how / hide / add a requirement on new profile
        addProfileRequirementOpen: () => {
          $scope.editRequirements.selectedProfiles.splice(0, $scope.editRequirements.selectedProfiles.length);
          $scope.editRequirements.excludeProfiles = $scope.activeProfiles.map((p) => { return p.id; });
          $scope.editRequirements.addProfileRequirementShow = true;
        },

        addProfileRequirementHide: () => {
          $scope.editRequirements.addProfileRequirementShow = false;
        },

        addProfileRequirementApply: () => {
          var entity = $scope.editRequirements.entity;
          var profileRequirements = entity.profileRequirements;
          if (!profileRequirements) {
            profileRequirements = [];
            entity.profileRequirements = profileRequirements;
          }
          angular.forEach($scope.editRequirements.selectedProfiles, (profile) => {
            var id = profile.id;
            if (id) {
              profileRequirements.push({profile: id});
            }
          });
          $scope.editRequirements.addProfileRequirementHide();
        }
      };

      $scope.getFilteredName = (item) => {
        return item.versionId + " / " + item.id;
      };

      $scope.filterContainer = (container) => {
        var filterText = $scope.containerIdFilter;
        var filterName = $scope.getFilteredName(container);

        if (!Core.matchFilterIgnoreCase(filterName, filterText)) {
          // we did not match the container name, then try to see if we match any of its profiles
          var profileIds = container.profileIds;
          if (profileIds) {
            return profileIds.any(id => Core.matchFilterIgnoreCase(id, filterText));
          }
          return false;
        }
        return true;
      };

      $scope.$watch('editRequirements.addDependentProfileDialogShow', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (newValue) {
            $scope.currentPage = $templateCache.get("addDependentProfile");
          } else {
            $scope.currentPage = $templateCache.get("addProfileRequirements");
          }
        }
      });

      $scope.$watch('editRequirements.addProfileRequirementShow', (newValue, oldValue) => {
        if (newValue !== oldValue) {
          if (newValue) {
            $scope.currentPage = $templateCache.get("addProfileRequirement")
          } else {
            $scope.currentPage = $templateCache.get("addProfileRequirements");
          }
        }
      });

      // invoked regularly by Jolokia after detecting new response from requirements()
      // from object io.fabric:type=Fabric
      $scope.updateActiveContainers = () => {
        var activeProfiles = $scope.activeProfiles;
        $scope.activeProfiles = $scope.currentActiveProfiles();
        $scope.activeProfiles.each((activeProfile) => {

          var ap = activeProfiles.find((ap) => { return ap.id === activeProfile.id && ap.versionId === activeProfile.versionId });
          if (ap) {
            activeProfile['selected'] = ap.selected;
            activeProfile['expanded'] = ap.expanded;
          } else {
            activeProfile['selected'] = false;
            activeProfile['expanded'] = false;
          }
        });
      };

      // invoked regularly by Jolokia wth the result of containers(List, List)
      // from object io.fabric:type=Fabric
      $scope.updateContainers = (newContainers) => {

        var response = angular.toJson(newContainers);
        if ($scope.containersResponse !== response) {
          $scope.containersResponse = response;

          newContainers = newContainers.sortBy('id');

          var rootContainers = newContainers.exclude((c) => { return !c.root; });
          var childContainers = newContainers.exclude((c) => { return c.root; });

          if (childContainers.length > 0) {
            var tmp = [];
            rootContainers.each((c) => {
              tmp.add(c);
              var children = childContainers.exclude((child) => { return child.parentId !== c.id });
              tmp.add(children);
            });
            newContainers = tmp;
          }

          if (angular.isDefined($scope.atVersion)) {
            newContainers = newContainers.filter((c) => { return c.versionId === $scope.atVersion; });
          }

          if (angular.isDefined($scope.withoutProfile)) {
            newContainers = newContainers.filter((c) => {
              return !c.profileIds.any((p) => { return p === $scope.withoutProfile; });
            });
          }

          newContainers.each((container) => {
            container.services = getServiceList(container);
            container.icon = Fabric.getTypeIcon(container);
            var c = $scope.containers.find((c) => { return c.id === container.id; });
            if (c) {
              container['selected'] = c.selected;
            } else {
              container['selected'] = false;
            }
            if ($scope.selectedContainerIds.any(container.id)) {
              container.selected = true;
            }
          });

          $scope.containers = newContainers;
          $scope.updateActiveContainers();
          Core.$apply($scope);
        }
      };


      $scope.currentActiveProfiles = () => {
        var answer = [];

        $scope.containers.each((container) => {
          container.profileIds.each((profile) => {

            var p = container.profiles.find((p) => { return p.id === profile; });
            if (p && p.hidden) {
              return;
            }

            var activeProfile = answer.find((o) => { return o.versionId === container.versionId && o.id === profile });

            if (activeProfile) {
              activeProfile['containers'] = activeProfile['containers'].include(container.id).unique();

              activeProfile.count = activeProfile['containers'].length;
            } else {
              answer.push({
                id: profile,
                count: 1,
                versionId: container.versionId,
                containers: [container.id],
                selected: false,
                requirements: null,
                requireStyle: null
              });
            }
          });
        });

        if ($scope.requirements) {
          angular.forEach($scope.requirements.profileRequirements, (profileRequirement) => {
            var id = profileRequirement.profile;
            var min = profileRequirement.minimumInstances;
            if (id) {
              var profile = answer.find((p) => (p.id === id));

              function requireStyle() {
                var count:any = 0;
                if (profile) {
                  count = profile['count'];
                }
                return Fabric.containerCountBadgeStyle(min, count);
              }

              if (profile) {
                profile["requirements"] = profileRequirement;
                profile["requireStyle"] = requireStyle();
              } else {
                // lets add the profile with no containers
                answer.push({
                  id: id,
                  count: 0,
                  versionId: $scope.requirements.version || "1.0",
                  containers: [],
                  selected: false,
                  requirements: profileRequirement,
                  requireStyle: requireStyle()
                });
              }
            }
          });
        }

        return answer;
      };


      $scope.updateEnsembleContainerIdList = (ids) => {
        var response = angular.toJson(ids);
        if ($scope.ensembleContainerIdsResponse !== response) {
          $scope.ensembleContainerIdsResponse = response;
          $scope.ensembleContainerIds = ids;
          Core.$apply($scope);
        }
      };


      $scope.dispatch = (response) => {
        switch (response.request.operation) {
          case($scope.containersOp):
            $scope.updateContainers(response.value);
            return;
        }
        switch (response.request.attribute) {
          case($scope.ensembleContainerIdListOp):
            $scope.updateEnsembleContainerIdList(response.value);
            return;
        }
      };

      $scope.clearSelection = (group) => {
        group.each((item) => { item.selected = false; });
      };


      $scope.setActiveProfile = (profile) => {
        $scope.clearSelection($scope.activeProfiles);
        if (!profile || profile === null) {
          return;
        }
        profile.selected = true;
      };


      $scope.selectAllContainers = () => {
        $scope.containers.each((container) => {
          if ($scope.filterContainer(container)) {
            container.selected = true;
          }
        });
      };


      $scope.setActiveContainer = (container) => {
        $scope.clearSelection($scope.containers);
        if (!container || container === null) {
          return;
        }
        container.selected = true;
      };

      $scope.startSelectedContainers = () => {
        $scope.selectedContainers.each((c) => {
          $scope.startContainer(c.id);
        });
      };


      $scope.stopSelectedContainers = () => {
        $scope.selectedContainers.each((c) => {
          $scope.stopContainer(c.id);
        });
      };

      $scope.startContainer = (name) => {
        doStartContainer($scope, jolokia, name);
      };


      $scope.stopContainer = (name) => {
        doStopContainer($scope, jolokia, name);
      };


      $scope.anySelectionAlive = (state) => {
        var selected = $scope.selectedContainers;
        return selected.length > 0 && selected.any((s) => s.alive === state);
      };


      $scope.everySelectionAlive = (state) => {
        var selected = $scope.selectedContainers;
        return selected.length > 0 && selected.every((s) => s.alive === state);
      };


      Core.register(jolokia, $scope, [
        {type: 'exec', mbean: Fabric.managerMBean, operation: $scope.containersOp, arguments: [$scope.containerArgs, $scope.profileFields]},
        {type: 'read', mbean: Fabric.clusterManagerMBean, attribute: $scope.ensembleContainerIdListOp}
      ], onSuccess($scope.dispatch, { silent: true }));

    }

    public link = ($scope, $element, $attrs) => {
      $scope.showSelect = Core.parseBooleanValue(UI.getIfSet('showSelect', $attrs, 'true'));

      var atVersion = UI.getIfSet('atVersion', $attrs, null);
      var withoutProfile = UI.getIfSet('withoutProfile', $attrs, null);

      if (atVersion !== null) {
        $scope.atVersion = $scope.$eval(atVersion);
      }

      if (withoutProfile !== null) {
        $scope.withoutProfile = $scope.$eval(withoutProfile);
      }

      log.debug("atVersion: ", $scope.atVersion);
      log.debug("withoutProfile: ", $scope.withoutProfile);

      log.debug("container list attributes: ", $attrs);


    };

  }


  export class ActiveProfileList extends Fabric.ContainerList {

    public templateUrl = Fabric.templatePath + "activeProfileList.html";

    public controller($scope, $element, $attrs, jolokia, $location, workspace, $templateCache) {

      super.controller($scope, $element, $attrs, jolokia, $location, workspace, $templateCache);

      $scope.searchFilter = '';

      $scope.isOpen = (profile) => {
        if ($scope.searchFilter !== '') {
          return "opened";
        }
        return "closed";
      };

      $scope.containersForProfile = (id) => {
        return $scope.containers.filter((container) => {
          return container.profileIds.some(id);
        });
      };

      $scope.profileMatchesFilter = (profile) => {
        var filterText = $scope.searchFilter;

        return Core.matchFilterIgnoreCase(profile.id, filterText) ||
          !profile.containers.filter(id => Core.matchFilterIgnoreCase(id, filterText)).isEmpty();
      };

      $scope.containerMatchesFilter = (container) => {
        var filterText = $scope.searchFilter;
        return Core.matchFilterIgnoreCase(container.id, filterText) ||
          !container.profileIds.filter(id => Core.matchFilterIgnoreCase(id, filterText)).isEmpty;
      };

      $scope.updateRequirements = (requirements) => {
        function onRequirementsSaved(response) {
          $scope.requirements = requirements;
          notification("success", "Updated the requirements");
          $scope.updateActiveContainers();
          Core.$apply($scope);
        };

        if (requirements) {
          $scope.editRequirements.dialog.close();

          var json = JSON.stringify(requirements);
          jolokia.execute(Fabric.managerMBean, "requirementsJson",
                  json, onSuccess(onRequirementsSaved));
        }
      };

      function onRequirements(response) {
        var responseJson = angular.toJson(response.value);

        if (responseJson !== $scope.requirementsResponse) {
          $scope.requirementsResponse = responseJson;
          $scope.requirements = response.value;
          $scope.updateActiveContainers();
          Core.$apply($scope);
        }
      }

      Core.register(jolokia, $scope, {type: 'exec', mbean: Fabric.managerMBean, operation: "requirements()"}, onSuccess(onRequirements));
    }
  }
}
