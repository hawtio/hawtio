/**
 * @module Osgi
 */
module Osgi {
  export function PidController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams, $location, jolokia) {
    $scope.deletePropDialog = new Core.Dialog();
    $scope.deletePidDialog = new Core.Dialog();
    $scope.addPropertyDialog = new Core.Dialog();
    $scope.factoryPid = $routeParams.factoryPid;
    $scope.pid = $routeParams.pid || $scope.factoryPid;

    $scope.modelLoaded = false;
    $scope.canSave = false;

    $scope.setEditMode = (flag) => {
      $scope.editMode = flag;
      $scope.formMode = flag ? "edit" : "view";
      if (!flag || !$scope.entity) {
        $scope.entity = {};
        updateTableContents();
      }
    };
    var startInEditMode = $scope.factoryPid && !$routeParams.pid;
    $scope.setEditMode(startInEditMode);

    $scope.$on("hawtio.form.modelChange", () => {
      if ($scope.modelLoaded) {
        // TODO lets check if we've really changed the values!
        enableCanSave();
        Core.$apply($scope);
      }
    });

    function goToConfigurations() {
      $location.path("/osgi/configurations");
    }

    function updatePid(mbean, pid, json) {
        jolokia.execute(mbean, "configAdminUpdate", pid, json, onSuccess((response) => {
          $scope.canSave = false;
          $scope.setEditMode(false);
          notification("success", "Successfully updated pid: " + pid);

          if (pid && $scope.factoryPid && !$routeParams.pid) {
            // we've just created a new pid so lets move to the full pid URL
            var newPath = Osgi.createPidPath(pid, $scope.factoryPid);
            $location.path(newPath);
            //goToConfigurations();
          }
        }));
    }

    $scope.pidSave = () => {
      var data = {};

      angular.forEach($scope.entity, (value, key) => {
        data[decodeKey(key)] = value;
      });

      //log.info("about to update value " + angular.toJson(data));

      var mbean = getHawtioConfigAdminMBean(workspace);
      if (mbean) {
        var pidMBean = getSelectionConfigAdminMBean(workspace);
        var pid = $scope.pid;
        var json = JSON.stringify(data);
        var factoryPid = $scope.factoryPid;
        if (factoryPid && pidMBean) {
          // lets generate a new pid
          jolokia.execute(pidMBean, "createFactoryConfiguration", factoryPid, onSuccess((response) => {
            pid = response;
            if (pid) {
              updatePid(mbean, pid, json);
            }
          }, {
            error: (response) => {
              notification("error", "Failed to create new PID: " +  response['error'] || response);
              Core.defaultJolokiaErrorHandler(response);
            }
          }));
        } else {
          updatePid(mbean, pid, json);
        }
      }
    };

    function enableCanSave() {
      if ($scope.editMode) {
        $scope.canSave = true;
      }
    }

    $scope.addPropertyConfirmed = (key, value) => {
      $scope.addPropertyDialog.close();
      $scope.configValues[key] = {
        Key: key,
        Value: value,
        Type: "String"
      };
      enableCanSave();
      updateSchema();
    };

    $scope.deletePidProp = (e) => {
      $scope.deleteKey = e.Key;
      $scope.deletePropDialog.open();
    };

    $scope.deletePidPropConfirmed = () => {
      $scope.deletePropDialog.close();
      var cell:any = document.getElementById("pid." + $scope.deleteKey);
      cell.parentElement.remove();
      enableCanSave();
    };

    $scope.deletePidConfirmed = () => {
      $scope.deletePidDialog.close();

      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.request({
          type: "exec",
          mbean: mbean,
          operation: 'delete',
          arguments: [$scope.pid]
        }, {
          error: function (response) {
            notification("error", response.error);
          },
          success: function (response) {
            notification("success", "Successfully deleted pid: " + $scope.pid);
            goToConfigurations();
          }
        });
      }
    };

    function populateTable(response) {
      $scope.modelLoaded = true;
      var configValues = response.value || {};
      $scope.configValues = configValues;
      updateSchema();
      var metaTypeMBean = getMetaTypeMBean(workspace);
      if (metaTypeMBean) {
        var locale = null;
        var pid = null;
        var factoryId = configValues["service.factoryPid"];
        if (factoryId) {
          pid = factoryId["Value"];
        }
        pid = pid || $scope.pid;
        jolokia.execute(metaTypeMBean, "getPidMetaTypeObject", pid, locale, onSuccess(onMetaType));
      }
      Core.$apply($scope);
    }

    function onMetaType(response) {
      $scope.metaType = response;
      updateSchema();
      Core.$apply($scope);
    }

    /**
     * Updates the JSON schema model
     */
    function updateSchema() {
      var properties = {};
      var required = [];
      var schema = {
        type: "object",
        required: required,
        properties: properties
      };
      $scope.schema = schema;
      var inputClass = "span12";
      var labelClass = "control-label";

      var metaType = $scope.metaType;
      if (metaType) {
        schema["id"] = metaType.id;
        schema["name"] = metaType.name;
        schema["description"] = metaType.description;

        angular.forEach(metaType.attributes, (attribute) => {
          var id = attribute.id;
          if (isValidProperty(id)) {
            var key = encodeKey(id);
            var typeName = asJsonSchemaType(attribute.typeName, attribute.id);
            var attributeProperties = {
              title: attribute.name,
              tooltip: attribute.description,
              'input-attributes': {
                class: inputClass
              },
              'label-attributes': {
                class: labelClass
              },
              type: typeName

            };
            if (attribute.typeName === "char") {
              attributeProperties["maxLength"] = 1;
              attributeProperties["minLength"] = 1;
            }
            var cardinality = attribute.cardinality;
            if (cardinality) {
              attributeProperties.type = "array";
              attributeProperties["items"] = {
                "type": typeName
              };
            }
            if (attribute.required) {
              required.push(id);
            }
            var defaultValue = attribute.defaultValue;
            if (defaultValue) {
              if (angular.isArray(defaultValue) && defaultValue.length === 1) {
                defaultValue = defaultValue[0];
              }
              attributeProperties["default"] = defaultValue;
            }
            var optionLabels = attribute.optionLabels;
            var optionValues = attribute.optionValues;
            if (optionLabels && optionLabels.length && optionValues && optionValues.length) {
              // enum type
              log.info("enum type " + id + " for labels " + optionLabels + " and values " + optionValues);
            }
            properties[key] = attributeProperties;
          }
        });
      }

      // now add all the missing properties...
      var entity = {};
      angular.forEach($scope.configValues, (value, rawKey) => {
        if (isValidProperty(rawKey)) {
          var key = encodeKey(rawKey);
          var attrValue = value;
          var attrType = "string";
          if (angular.isObject(value)) {
            attrValue = value.Value;
            attrType = asJsonSchemaType(value.Type, rawKey);
          }
          entity[key] = attrValue;
          if (!properties[key]) {
            properties[key] = {
              'input-attributes': {
                class: inputClass
              },
              'label-attributes': {
                class: labelClass
              },
              type: attrType
            }
          }
        }
      });
      $scope.entity = entity;
    }

    function isValidProperty(id) {
      return id && id !== "service.pid" && id !== "service.factoryPid";
    }

    function encodeKey(key) {
      return key.replace(/\./g, "__");
    }

    function decodeKey(key) {
      return key.replace(/__/g, ".");
    }

    function asJsonSchemaType(typeName, id) {
      if (typeName) {
        var lower = typeName.toLowerCase();
        if (lower.startsWith("int") || lower === "long" || lower === "short" || lower === "byte" || lower.endsWith("int")) {
          return "integer";
        }
        if (lower === "double" || lower === "float" || lower === "bigdecimal") {
          return "number";
        }
        if (lower === "string") {
          // TODO hack to try force password type on dodgy metadata such as pax web
          if (id && id.endsWith("password")) {
            return "password";
          }
          return "string";
        }
        return typeName;
      } else {
        return "string";
      }
    }

    function updateTableContents() {
      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        $scope.modelLoaded = false;
        jolokia.request(
          {type: 'exec', mbean: mbean, operation: 'getProperties', arguments: [$scope.pid]},
          onSuccess(populateTable));
      }
    }
  }
}
