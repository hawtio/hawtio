/// <reference path="fabricPlugin.ts"/>
module Fabric {

  _module.directive('fabricVersionSelector', ["$templateCache", ($templateCache) => {
    return Fabric.VersionSelector($templateCache);
  }]);
  _module.directive('fabricProfileSelector', () => {
    return new Fabric.ProfileSelector();
  });
  _module.directive('fabricContainerList', () => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: Fabric.templatePath + "containerList.html",
      scope: false,
      controller: ["$scope", "$element", "$attrs", "jolokia", "$location", "workspace", "$templateCache", ContainerListDirectiveController],
      link: ["$scope", "$element", "$attrs", ContainerListDirectiveLink]
    }
  });
  _module.directive('fabricProfileDetails', () => {
    return new Fabric.ProfileDetails();
  });
  _module.directive('fabricActiveProfileList', () => {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: Fabric.templatePath + "activeProfileList.html",
      scope: false,
      controller: ["$scope", "$element", "$attrs", "jolokia", "$location", "workspace", "$templateCache", "$timeout", ActiveProfileListController],
      link: ["$scope", "$element", "$attrs", ContainerListDirectiveLink]
    }
  });
  _module.directive('fabricProfileLink', ["workspace", "jolokia", "localStorage", (workspace, jolokia, localStorage) => {
    return {
        restrict: 'A',
        link: ($scope, $element, $attrs) => {
        var profileId = $attrs['fabricProfileLink'];

        if (profileId && !profileId.isBlank() && Fabric.fabricCreated(workspace)) {
          var container = Fabric.getCurrentContainer(jolokia, ['versionId']);
          var versionId = container['versionId'];
          if (versionId && !versionId.isBlank()) {
            var url = '#' + Fabric.profileLink(workspace, jolokia, localStorage, versionId, profileId);
            if (angular.isDefined($attrs['file'])) {
              url = url + "/" + $attrs['file'];
            }

            $element.attr('href', url);
          }
        }
      }
    }
  }]);
  _module.directive('fabricContainers', ["$location", "jolokia", "workspace", "$compile", ($location, jolokia, workspace, $compile) => {
    return {
        restrict: 'A',
        link: ($scope, $element, $attrs) => {
        var model = $attrs['fabricContainers'];
        var profileId = $attrs['profile'];
        var version = $scope.versionId || $scope.version || "1.0";
        if (model && !model.isBlank() && profileId && !profileId.isBlank()) {
          // lets expose the $scope.connect object!

          Fabric.initScope($scope, $location, jolokia, workspace);
          var containerIds = Fabric.getContainerIdsForProfile(jolokia, version, profileId);
          log.info("Searching for containers for profile: " + profileId + " version " + version + ". Found: " + containerIds);
          $scope[model] = containerIds;

          $scope["onCancel"] = () => {
            console.log("In our new cancel thingy!");
          };

          // now lets add the connect dialog
          var dialog = $("<div ng-include=\"'app/fabric/html/connectToContainerDialog.html'\"></div>");
          var answer = $compile(dialog)($scope);
          $element.append(answer);
        }
      }
    }
  }]);

  _module.directive('fabricContainerLink', ["$location", "jolokia", "workspace", ($location, jolokia, workspace) => {
      return {
        restrict: 'A',
        scope: { containerModel: '@fabricContainerLink' },
        link: ($scope, $element, $attrs) => {
          $scope.$watch("containerModel", function (nv) {
            var modelName = $scope.containerModel;
            var containerId = modelName;
            var container = null;
            if (modelName && !modelName.isBlank()) {
              // lets check if the value is a model object containing the container details
              var modelValue = Core.pathGet($scope, modelName);
              if (angular.isObject(modelValue)) {
                var id = modelValue["container"] || modelValue["containerId"] || modelValue["id"];
                if (id && modelValue["provisionResult"]) {
                  container = modelValue;
                  containerId = id;
                }
              }
              if (!container) {
                var fields = ["alive", "provisionResult", "versionId", "jmxDomains"];
                container = Fabric.getContainerFields(jolokia, containerId, fields);
              }

              var link = "#/fabric/container/" + containerId;
              var title = Fabric.statusTitle(container) || "container " + containerId;
              var icon = Fabric.statusIcon(container) || "";

              var html = "<a href='" + link + "' title='" + title + "'><i class='" + icon + "'></i> " + containerId + "</a>";
              $element.html(html);
            } else {
              $element.html(" ");
            }
          });
        }
      }
    }]);

  _module.directive('fabricContainerConnect', ["$location", "jolokia", ($location, jolokia) => {
    return {
        restrict: 'A',
        link: ($scope, $element, $attrs) => {
        var containerId = $attrs['fabricContainerConnect'];
        var view = $attrs['view'];
        if (containerId && !containerId.isBlank()) {
          //var fields = ["parentId", "profileIds", "versionId", "provisionResult", "jolokiaUrl", "root", 'jmxDomains'];
          var fields = ["jolokiaUrl"];
          //Fabric.initScope($scope, $location, jolokia, workspace);

          var connectFn = () => {
            var container = Fabric.getContainerFields(jolokia, containerId, fields);
            log.info("Connecting to container id " + containerId + " view + " + view);
            container["id"]  = containerId;
            $scope.doConnect(container, view);
            Core.$apply($scope);
          };
          $element.on("click", connectFn);
        }
      }
    }
  }]);

  _module.directive('fabricVersionLink', ["workspace", "jolokia", "localStorage", (workspace, jolokia, localStorage) => {
    return {
        restrict: 'A',
          link: ($scope, $element, $attrs) => {
              var versionLink = $attrs['fabricVersionLink'];

              if (versionLink && !versionLink.isBlank() && Fabric.fabricCreated(workspace)) {
                  var container = Fabric.getCurrentContainer(jolokia, ['versionId']);
                  var versionId = container['versionId'] || "1.0";
                  if (versionId && !versionId.isBlank()) {
                      var url = "#/wiki/branch/" + versionId + "/" + Core.trimLeading(versionLink, "/");
                      $element.attr('href', url);
                  }
              }
          }
      }
  }]);

  _module.directive('containerNameAvailable', ["workspace", "jolokia", "localStorage", (workspace, jolokia, localStorage) => {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: ($scope, $element, $attrs, $ctrl) => {
          $ctrl.$parsers.unshift(function(viewValue) {
            var found = $scope.child.rootContainers.indexOf(viewValue);
            if (found !== -1) {
              // it is invalid, return undefined (no model update)
              $ctrl.$setValidity('taken', false);
              return undefined;
            } else {
              // it is valid
              $ctrl.$setValidity('taken', true);
              return viewValue;
            }
          });
        }
      }
  }]);


}
