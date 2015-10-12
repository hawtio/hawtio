/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.PropertiesDataFormatController", ["$scope", "workspace", "localStorage", "jolokia", ($scope, workspace:Workspace, localStorage:WindowLocalStorage, jolokia) => {
    var log:Logging.Logger = Logger.get("Camel");

    $scope.hideHelp = Camel.hideOptionDocumentation(localStorage);
    $scope.hideUnused = Camel.hideOptionUnusedValue(localStorage);
    $scope.hideDefault = Camel.hideOptionDefaultValue(localStorage);

    $scope.viewTemplate = null;
    $scope.schema = null;
    $scope.model = null;
    $scope.labels = [];
    $scope.nodeData = null;
    $scope.icon = null;
    $scope.dataFormatName = null;

    $scope.$watch('hideHelp', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        updateData();
      }
    });

    $scope.$watch('hideUnused', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        updateData();
      }
    });

    $scope.$watch('hideDefault', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        updateData();
      }
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateData, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateData();
    });

    $scope.showEntity = function (id) {
      if ($scope.hideDefault) {
        if (isDefaultValue(id)) {
          return false;
        }
      }

      if ($scope.hideUnused) {
        if (!hasValue(id)) {
          return false;
        }
      }

      return true;
    };

    function isDefaultValue(id) {
      var defaultValue = Core.pathGet($scope.model, ["properties", id, "defaultValue"]);
      if (angular.isDefined(defaultValue)) {
        // get the value
        var value = Core.pathGet($scope.nodeData, id);
        if (angular.isDefined(value)) {
          // default value is always a String type, so try to convert value to a String
          var str:string = value.toString();
          // is it a default value
          return str.localeCompare(defaultValue) === 0;
        }
      }
      return false;
    }

    function hasValue(id) {
      var value = Core.pathGet($scope.nodeData, id);
      if (angular.isUndefined(value) || Core.isBlank(value)) {
        return false;
      }
      if (angular.isString(value)) {
        // to show then must not be blank
        return !Core.isBlank(value);
      }
      return true;
    }

    function updateData() {
      var dataFormatMBeanName:string = null;
      if (!dataFormatMBeanName) {
        dataFormatMBeanName = workspace.getSelectedMBeanName();
      }
      if (dataFormatMBeanName) {
        log.info("Calling informationJson");
        var query = {
          type: 'exec',
          mbean: dataFormatMBeanName,
          operation: 'informationJson'
        };
        jolokia.request(query, onSuccess(populateData));
      }
    }

    function populateData(response) {
      log.debug("Populate data " + response);

      var data = response.value;
      if (data) {
        // the model is json object from the string data
        $scope.model = JSON.parse(data);
        // set title and description
        $scope.model.title = $scope.model.dataformat.title  + " (" + $scope.model.dataformat.name + ")";
        $scope.model.description = $scope.model.dataformat.description;
        // TODO: look for specific component icon,
        $scope.icon = Core.url("/img/icons/camel/marshal24.png");

        // grab all values form the model as they are the current data we need to add to node data (not all properties has a value)
        $scope.nodeData = {};
        var tabs = {};
        tabs = Camel.buildTabsFromProperties(tabs, $scope.model.properties, false, false);
        tabs = Camel.sortPropertiesTabs(tabs);
        $scope.model.tabs = tabs;

        angular.forEach($scope.model.properties, function (property, key) {
          // does it have a value or fallback to use a default value
          var value = property["value"] || property["defaultValue"];
          if (angular.isDefined(value) && value !== null) {
            $scope.nodeData[key] = value;
          }

          // remove label as that causes the UI to render the label instead of the key as title
          // we should later group the table into labels (eg consumer vs producer)
          delete property["label"];
        });

        // remove id, as it causes the page to indicate a required field
        delete $scope.model.properties["id"];

        var labels = [];
        if ($scope.model.dataformat.label) {
          labels = $scope.model.dataformat.label.split(",");
        }
        $scope.labels = labels;

        $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";

        Core.$apply($scope);
      }
    }

  }]);
}



