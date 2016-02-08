/**
 * module Core
 */
/// <reference path="corePlugin.ts"/>
/// <reference path="preferenceHelpers.ts"/>
module Core {

  export var PluginPreferences = _module.controller("Core.PluginPreferences", ["$scope", "localStorage", "$location", "workspace", "jolokia", ($scope, localStorage, $location, workspace, jolokia) => {

    Core.initPreferenceScope($scope, localStorage, {
      'autoRefresh': {
        'value': true,
        'converter': Core.parseBooleanValue
      }
    });

    $scope.perspectiveId = null;
    $scope.perspectives = [];

    $scope.plugins = [];
    $scope.pluginDirty = false;

    $scope.pluginMoveUp = (index) => {
      $scope.pluginDirty = true;
      var tmp = $scope.plugins[index];
      $scope.plugins[index] = $scope.plugins[index - 1];
      $scope.plugins[index - 1] = tmp
    };

    $scope.pluginMoveDown = (index) => {
      $scope.pluginDirty = true;
      var tmp = $scope.plugins[index];
      $scope.plugins[index] = $scope.plugins[index + 1];
      $scope.plugins[index + 1] = tmp
    };

    $scope.pluginDisable = (index) => {
      $scope.pluginDirty = true;
      var atLeastOneEnabled = false;
      $scope.plugins.forEach((p:any, idx) => {
        if (idx != index && p.enabled) {
          atLeastOneEnabled = true;
        }
      });
      if (atLeastOneEnabled) {
        $scope.plugins[index].enabled = false;
        $scope.plugins[index].isDefault = false;
      }
    };

    $scope.pluginEnable = (index) => {
      $scope.pluginDirty = true;
      $scope.plugins[index].enabled = true;
    };

    $scope.pluginDefault = (index) => {
      $scope.pluginDirty = true;
      $scope.plugins.forEach((p:any) => {
        p.isDefault = false;
      });
      $scope.plugins[index].isDefault = true;
      $scope.plugins[index].enabled = true;
    };

    $scope.pluginApply = () => {
      $scope.pluginDirty = false;

      // set index before saving
      // if no plugin is default, set first enabled as default
      var noDefault = true;
      $scope.plugins.forEach((p:any, idx) => {
        if (p.isDefault) {
          noDefault = false;
        }
        p.index = idx;
      });
      if (noDefault) {
        $scope.plugins.find((p:any) => {
          return p.enabled == true;
        }).isDefault = true;
      }

      var json = angular.toJson($scope.plugins);
      if (json) {
        log.debug("Saving plugin settings for perspective " + $scope.perspectiveId + " -> " + json);
        var id = "plugins-" + $scope.perspectiveId;
        localStorage[id] = json;
      }

      // force UI to update by reloading the page which works
      setTimeout(() => {
        window.location.hash = "#";
      }, 10);
    };

    $scope.$watch('perspectiveId', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      var perspective = Perspective.getPerspectiveById(newValue);
      if (perspective) {
        updateToPerspective(perspective);
        Core.$apply($scope);
      }
    });

    function updateToPerspective(perspective) {
      var plugins = Core.configuredPluginsForPerspectiveId(perspective.id, workspace, jolokia, localStorage);
      $scope.plugins = plugins;
      $scope.perspectiveId = perspective.id;
      log.debug("Updated to perspective " + $scope.perspectiveId + " with " + plugins.length + " plugins");
    }

    // initialize the controller, and pick the 1st perspective
    $scope.perspectives = Perspective.getPerspectives($location, workspace, jolokia, localStorage);
    log.debug("There are " + $scope.perspectives.length + " perspectives");

    // pick the current selected perspective
    var selectPerspective;
    var perspectiveId = Perspective.currentPerspectiveId($location, workspace, jolokia, localStorage);
    if (perspectiveId) {
      selectPerspective = $scope.perspectives.find(p => p.id === perspectiveId);
    }
    if (!selectPerspective) {
      // just pick the 1st then
      selectPerspective = $scope.perspectives[0];
    }

    updateToPerspective(selectPerspective);
    // and force update the ui
    Core.$apply($scope);

  }]);
}
