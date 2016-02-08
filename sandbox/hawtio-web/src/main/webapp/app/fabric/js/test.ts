/// <reference path="fabricPlugin.ts"/>
module Fabric {


  _module.controller("Fabric.TestController", ["$scope", "jolokia", "$q", "workspace", "$templateCache", ($scope, jolokia, $q, workspace, $templateCache) => {

    $scope.mavenMBean = Maven.getMavenIndexerMBean(workspace);

    $scope.html = "text/html";
    $scope.versionSelector = $templateCache.get("versionSelectorTemplate");
    $scope.profileIncludes = $templateCache.get("profile-includes");
    $scope.profileExcludes = $templateCache.get("profile-excludes");
    $scope.containerList = $templateCache.get("containerListTemplate");
    $scope.profileLink = $templateCache.get("profileLinkTemplate");

    $scope.version = {};
    $scope.versionId = '';
    $scope.someUri = '';
    $scope.uriParts = [];

    $scope.version = {};

    $scope.osp = [];
    $scope.vid = '1.0';
    $scope.someProfiles = ['a-mq', 'aws-ec2'];

    $scope.selectedProfiles = [{
      id: '1-dot-0',
      selected: true
    }, {
      id: 'a-mq',
      selected: true
    }];

    $scope.selectedProfilesString = "";

    $scope.$watch('version', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if ($scope.version && !Object.equal($scope.version, {})) {
          $scope.versionId = $scope.version.id;
        }
      }
    });

    $scope.$watch('osp', (newValue, oldValue) => {
      $scope.selectedProfilesString = angular.toJson($scope.osp);
    });

    $scope.$watch('someUri', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.uriParts = newValue.split("/");
      }
    });

    $scope.$watch('uriParts', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue.length === 1 && newValue.length < oldValue.length) {
          if (oldValue.last() !== '' && newValue.first().has(oldValue.last())) {
            var merged = oldValue.first(oldValue.length - 1).include(newValue.first());
            $scope.someUri = merged.join('/');
          }
        }
      }
    }, true);

    $scope.doCompletionMaven = (something) => {
      return Maven.completeMavenUri($q, $scope, workspace, jolokia, something);
    }

    $scope.doCompletionFabric = (something) => {
      return Fabric.completeUri($q, $scope, workspace, jolokia, something);
    }
  }]);
}
