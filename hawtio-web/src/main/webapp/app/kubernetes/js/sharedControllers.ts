/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
module Kubernetes {

  // controller that handles the 'id' field of a given view
  export var IDSelector = controller("IDSelector", ["$scope", ($scope) => {
    $scope.select = (id) => {
      $scope.$emit('kubeSelectedId', id);
    }
  }]);

  // controller for the status icon cell
  export var PodStatus = controller("PodStatus", ["$scope", ($scope) => {
    $scope.statusMapping = {
      'Running': 'icon-play-circle green',
      'Waiting': 'icon-download',
      'Terminated': 'icon-off yellow'
    };
  }]);

  // controller that deals with the labels per pod
  export var Labels = controller("Labels", ["$scope", "workspace", "jolokia", "$location", ($scope, workspace, jolokia, $location) => {
    $scope.labels = {};
    $scope.$watch('entity', (newValue, oldValue) => {
      if (newValue) {
        log.debug("labels: ", newValue);
        // massage the labels a bit
        angular.forEach($scope.entity.labels, (value, key) => {
          if (key === 'fabric8') {
            // TODO not sure what this is for, the container type?
            return;
          }
          $scope.labels[key] = {
            title: value
          };
        });
      }
    });
    $scope.handleClick = (entity, labelType:string, value) => {
      log.debug("handleClick, entity: ", entity, " labelType: ", labelType, " value: ", value);
/*
      switch (labelType) {
        case 'container':
          if (entity.labels.container) {
            Fabric.gotoContainer(entity.labels.container);
          }
          return;
        case 'profile':
          if (entity.labels.version && entity.labels.profile) {
            Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, entity.labels.version, entity.labels.profile);
          }
          return;
        default:
          return;
      }
*/
      var filterTextSection = labelType + "=" + entity.labels[labelType];
      var parentScope = $scope;


      /**
       * Returns the value of the given key in this scope or an ancestor parent scope
       */
      var filter = undefined;
      while (true) {
        filter = parentScope["filter"];
        if (angular.isUndefined(filter)) {
          parentScope = parentScope.$parent;
          if (!parentScope) {
            break;
          }
        } else {
          break;
        }
      }
      if (filter) {
        var filterText = filter.text;
        if (filterText) {
          var expressions = filterText.split(/\s+/);
          if (expressions.any(filterTextSection)) {
            // lets exclude this filter expression
            expressions = expressions.remove(filterTextSection);
            filter.text = expressions.join(" ");
          } else {
            filter.text = filter.text + " " + filterTextSection;
          }
        } else {
          filter.text = filterTextSection;
        }
      }
      Core.$apply(parentScope);
    };

    var labelColors = {
      'profile': 'background-green mouse-pointer',
      'version': 'background-blue',
      'name': 'background-light-grey',
      'container': 'background-light-green mouse-pointer'
    };
    $scope.labelClass = (labelType:string) => {
      if (!(labelType in labelColors)) {
        return '';
      }
      else return labelColors[labelType];
    }
  }]);

}

