/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.PropertiesComponentController", ["$scope", "workspace", "localStorage", "jolokia", ($scope, workspace:Workspace, localStorage:WindowLocalStorage, jolokia) => {
    var log:Logging.Logger = Logger.get("Camel");
    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.workspace = workspace;

    $scope.hideHelp = Camel.hideOptionDocumentation(localStorage);
    $scope.hideUnused = Camel.hideOptionUnusedValue(localStorage);
    $scope.hideDefault = Camel.hideOptionDefaultValue(localStorage);

    $scope.viewTemplate = null;
    $scope.schema = null;
    $scope.model = null;
    $scope.labels = [];
    $scope.nodeData = null;
    $scope.icon = null;
    $scope.componentName = null;

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
      var contextMBean = getSelectionCamelContextMBean(workspace, camelJmxDomain);

      var componentMBeanName:string = null;
      if (!componentMBeanName) {
        componentMBeanName = workspace.getSelectedMBeanName();
      }
      if (componentMBeanName && contextMBean) {
        // TODO: grab name from tree instead? avoids a JMX call
        var reply = jolokia.request({type: "read", mbean: componentMBeanName, attribute: ["ComponentName"]});
        var name:string = reply.value["ComponentName"];
        if (name) {
          $scope.componentName = name;
          log.info("Calling explainComponentJson for name: " + name);
          var query = {
            type: 'exec',
            mbean: contextMBean,
            operation: 'explainComponentJson(java.lang.String,boolean)',
            arguments: [name, true]
          };
          jolokia.request(query, onSuccess(populateData));
        }
      }
    }

    function populateData(response) {
      log.debug("Populate data " + response);

      var data = response.value;
      if (data) {
        // the model is json object from the string data
        $scope.model = JSON.parse(data);
        // set title and description
        $scope.model.title = $scope.componentName;
        $scope.model.description = $scope.model.component.description;
        // TODO: look for specific component icon,
        $scope.icon = Core.url("/img/icons/camel/endpoint24.png");

        // grab all values form the model as they are the current data we need to add to node data (not all properties has a value)
        $scope.nodeData = {};
        var tabs = {};
        tabs = Camel.buildTabsFromProperties(tabs, $scope.model.componentProperties);
        $scope.model.tabs = tabs;

        // must be named properties as that is what the form expects
        $scope.model.properties = $scope.model.componentProperties;

        angular.forEach($scope.model.componentProperties, function (property, key) {
          // does it have a value or fallback to use a default value
          var value = property["value"] || property["defaultValue"];
          if (angular.isDefined(value) && value !== null) {
            $scope.nodeData[key] = value;
          }

          // remove label as that causes the UI to render the label instead of the key as title
          // we should later group the table into labels (eg consumer vs producer)
          delete property["label"];
        });

        var labels = [];
        if ($scope.model.component.label) {
          labels = $scope.model.component.label.split(",");
        }
        $scope.labels = labels;

        $scope.viewTemplate = "app/camel/html/nodePropertiesView.html";

        Core.$apply($scope);
      }
    }

  }]);
}



