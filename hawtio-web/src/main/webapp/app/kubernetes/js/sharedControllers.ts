/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
/// <reference path="../../wiki/js/wikiHelpers.ts"/>
module Kubernetes {

  // controller that maps a docker image to an icon path in the if possible
  var ReplicationControllerIcon = controller("ReplicationControllerIcon", ["$scope", "jolokia", ($scope, jolokia:Jolokia.IJolokia) => {
    $scope.iconUrl = 'img/icons/kubernetes.svg';
    jolokia.request({
      type: 'exec',
      mbean: Kubernetes.mbean,
      operation: "iconPath(java.lang.String,java.lang.String)",
      arguments: ['master', $scope.entity.id]
    }, onSuccess((response) => {
      if (response.value) {
        $scope.iconUrl = Wiki.gitRelativeURL('master', response.value);
        Core.$apply($scope);
      }
    }));
  }]);

  // controller that handles the 'id' field of a given view
  export var IDSelector = controller("IDSelector", ["$scope", ($scope) => {
    $scope.select = (id) => {
      $scope.$emit('kubeSelectedId', id);
    }
  }]);

  // controller for the status icon cell
  export var PodStatus = controller("PodStatus", ["$scope", ($scope) => {
    $scope.statusMapping = (text) => {
      if (text) {
        var lower = text.toLowerCase();
        if (lower.startsWith("run")) {
          return 'icon-play-circle green';
        } else if (lower.startsWith("wait")) {
          return 'icon-download';
        } else if (lower.startsWith("term") || lower.startsWith("error") || lower.startsWith("fail")) {
          return 'icon-off orange';
        }
      }
      return 'icon-question red';
    }
  }]);

  // controller that deals with the labels per pod
  export var Labels = controller("Labels", ["$scope", "workspace", "jolokia", "$location", ($scope, workspace, jolokia, $location) => {
    $scope.labels = [];
    var labelKeyWeights = {
      "name": 1,
      "replicationController": 2,
      "group": 3
    };
    $scope.$watch('entity', (newValue, oldValue) => {
      if (newValue) {
        // log.debug("labels: ", newValue);
        // massage the labels a bit
        $scope.labels = [];
        angular.forEach($scope.entity.labels, (value, key) => {
          if (key === 'fabric8') {
            // TODO not sure what this is for, the container type?
            return;
          }
          $scope.labels.push({
            key: key,
            title: value
          });
        });

        //  lets sort by key but lets make sure that we weight certain labels so they are first
        $scope.labels = $scope.labels.sort((a, b) => {
          function getWeight(key) {
            return labelKeyWeights[key] || 1000;
          }
          var n1 = a["key"];
          var n2 = b["key"];
          var w1 = getWeight(n1);
          var w2 = getWeight(n2);
          var diff = w1 - w2;
          if (diff < 0) {
            return -1;
          } else if (diff > 0) {
            return 1;
          }
          if (n1 && n2) {
            if (n1 > n2) {
              return 1;
            } else if (n1 < n2) {
              return -1;
            } else {
              return 0;
            }
          } else {
            if (n1 === n2) {
              return 0;
            } else if (n1) {
              return 1;
            } else {
              return -1;
            }
          }
        });
      }
    });

    $scope.handleClick = (entity, labelType:string, value) => {
      // log.debug("handleClick, entity: ", entity, " key: ", labelType, " value: ", value);
      var filterTextSection = labelType + "=" + value.title;
      $scope.$emit('labelFilterUpdate', filterTextSection);
    };

    var labelColors = {
      'version': 'background-blue',
      'name': 'background-light-green',
      'container': 'background-light-grey'
    };
    $scope.labelClass = (labelType:string) => {
      if (!(labelType in labelColors)) {
        return 'mouse-pointer';
      }
      else return labelColors[labelType] + ' mouse-pointer';
    }
  }]);

}

