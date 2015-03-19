/// <reference path="fabricPlugin.ts"/>
module Fabric {
  _module.controller("Fabric.FabricBrokersController", ["$scope", "localStorage", "$routeParams", "$location", "jolokia", "workspace", "$compile", "$templateCache", ($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) => {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.maps = {
      group: {},
      profile: {},
      broker: {},
      container: {}
    };

    $scope.showBroker = (broker) => {
      var brokerVersion = broker.version;
      var brokerProfile = broker.profile;
      var brokerId = broker.id;
      var path = Fabric.brokerConfigLink(workspace, jolokia, localStorage, brokerVersion, brokerProfile, brokerId);
      $location.path(path);
    };

    $scope.connectToBroker = (container, broker) => {
      Fabric.connectToBroker($scope, container);
    };


    $scope.createBroker = (group, profile) => {
      var args = {};
      if (group) {
        var groupId = group["id"];
        if (groupId) {
          args["group"] = groupId;
        }
      }
      if (profile) {
        var profileId = profile["id"];
        if (profileId) {
          args["profile"] = profileId;
        }
      }
      $location.url("/fabric/mq/createBroker").search(args);
    };

    function matchesFilter(text) {
      var filter = $scope.searchFilter;
      return !filter || (text && text.toLowerCase().has(filter.toLowerCase()));
    }

    $scope.groupMatchesFilter = (group) => {
      return matchesFilter(group.id) ||
              group.profiles.find((item) => $scope.profileMatchesFilter(item));
    };

    $scope.profileMatchesFilter = (profile) => {
      return matchesFilter(profile.id) || matchesFilter(profile.group) ||
              matchesFilter(profile.version) ||
              profile.brokers.find((item) => $scope.brokerMatchesFilter(item));
    };

    $scope.brokerMatchesFilter = (broker) => {
      return matchesFilter(broker.id) || matchesFilter(broker.group) ||
              matchesFilter(broker.version) ||
              broker.containers.find((item) => $scope.containerMatchesFilter(item));
    };

    $scope.containerMatchesFilter = (container) => {
      return matchesFilter(container.id) || matchesFilter(container.group) ||
              matchesFilter(container.profile) || matchesFilter(container.version) || matchesFilter(container.brokerName) ||
              (container.master && $scope.searchFilter && $scope.searchFilter.has("master"));
    };

    if (Fabric.hasMQManager) {
      Core.register(jolokia, $scope, {type: 'exec', mbean: Fabric.mqManagerMBean, operation: "loadBrokerStatus()"}, onSuccess(onBrokerData));
    }

    function onBrokerData(response) {

      if (response) {

        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson === responseJson) {
          return;
        }

        $scope.responseJson = responseJson;

        var brokers = response.value;

        function findByIdOrCreate(collection, id, map, fn) {
          var value = collection.find((v) => { return v && v['id'] === id});
          if (!value) {
            value = fn();
            value["id"] = id;
            collection.push(value);

            var old = map[id];
            // copy any view related across
            value["expanded"] = old ? old["expanded"] : true;
            map[id] = value;
          }
          return value;
        }

        $scope.groups = [];
        var maps = $scope.maps;

        angular.forEach(brokers, (brokerStatus) => {
          var groupId = brokerStatus.group || "Unknown";
          var profileId = brokerStatus.profile || "Unknown";
          var brokerId = brokerStatus.brokerName || "Unknown";
          var containerId = brokerStatus.container;
          var versionId = brokerStatus.version || "1.0";

          var group = findByIdOrCreate($scope.groups, groupId, maps.group, () => {
            return {
              profiles: []
            };
          });
          var profile = findByIdOrCreate(group.profiles, profileId, maps.profile, () => {
            return {
              group: groupId,
              version: versionId,
              requirements: {
                minimumInstances: brokerStatus.minimumInstances
              },
              brokers: [],
              containers: {}
            };
          });
          var connectTo = (brokerStatus.networks || []).join(",");
          var broker = findByIdOrCreate(profile.brokers, brokerId, maps.broker, () => {
            return {
              group: groupId,
              profile: profileId,
              version: versionId,
              containers: [],
              connectTo: connectTo
            };
          });
          if (containerId) {
            // lets create a container object per broker for the N+1 case
            var container = findByIdOrCreate(broker.containers, containerId, maps.container, () => {
              return brokerStatus;
            });
            if (container.master) {
              container.masterTooltip = " is the master for broker: " + brokerId;
            }
            profile.containers[containerId] = container;
          }
        });

        // update the stats
        angular.forEach($scope.groups, (group) => {

          angular.forEach(group.profiles, (profile) => {

            angular.forEach(profile.brokers, (broker) => {
              broker.containers = broker.containers.sortBy((c) => {
                return c.id;
              });
            });
            var count = Object.values(profile.containers).length;
            var required = profile.requirements.minimumInstances || 0;
            var max = profile.requirements.maximumInstances || -1;
            profile.requireStyle = Fabric.containerCountBadgeStyle(required, max, count);
            profile.count = count;
            profile.requiredToolTip = "this profile requires " + Core.maybePlural(required, "container")
                    + " to be running but is currently running " + Core.maybePlural(count, "container");
            if (required > count) {
              profile.requiredToolTip += ". click here to create more containers";
            }
          });
        });

        Core.$apply($scope);
      }
    }
  }]);
}
