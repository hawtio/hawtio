/**
 * @module Jmx
 */
module Jmx {

  export var propertiesColumnDefs = [
    {field: 'name', displayName: 'Property', width: "27%",
      cellTemplate: '<div class="ngCellText" title="{{row.entity.attrDesc}}" ' +
        'data-placement="bottom"><div ng-show="!inDashboard" class="inline" compile="getDashboardWidgets(row.entity)"></div>{{row.entity.name}}</div>'},
    {field: 'value', displayName: 'Value', width: "70%",
      cellTemplate: '<div class="ngCellText" ng-click="onViewAttribute(row.entity)" title="{{row.entity.tooltip}}" ng-bind-html-unsafe="row.entity.summary"></div>'
    }
  ];

  export var foldersColumnDefs = [
    {
      displayName: 'Name',
      cellTemplate: '<div class="ngCellText"><a href="{{folderHref(row)}}"><i class="{{folderIconClass(row)}}"></i> {{row.getProperty("title")}}</a></div>'
    }
  ];

  export function AttributesController($scope, $element, $location, workspace:Workspace, jolokia, jmxWidgets, jmxWidgetTypes) {
    $scope.searchText = '';
    $scope.columnDefs = [];
    $scope.selectedItems = [];

    $scope.lastKey = null;
    $scope.attributesInfoCache = {};

    $scope.entity = {};
    $scope.attributeSchema = {};

    var attributeSchemaBasic = {
      properties: {
        'key': {
          description: 'Key',
          tooltip: 'Attribute key',
          type: 'string',
          readOnly: 'true'
        },
        'description': {
          description: 'Description',
          tooltip: 'Attribute description',
          type: 'string',
          formTemplate: "<textarea class='input-xlarge' rows='2' readonly='true'></textarea>"
        },
        'type': {
          description: 'Type',
          tooltip: 'Attribute type',
          type: 'string',
          readOnly: 'true'
        }
      }
    };

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      showFilter: false,
      canSelectRows: false,
      enableRowSelection: false,
      keepLastSelected: false,
      multiSelect: false,
      showColumnMenu: true,
      displaySelectionCheckbox: false,
      filterOptions: {
        filterText: ''
      },
      // TODO disabled for now as it causes https://github.com/hawtio/hawtio/issues/262
      //sortInfo: { field: 'name', direction: 'asc'},
      data: 'gridData',
      columnDefs: 'columnDefs'
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) {
        Core.unregister(jolokia, $scope);
        return;
      }
      updateTableContents();
    });

    $scope.hasWidget = (row) => {
      console.log("Row: ", row);
      return true;
    };

    $scope.onCancelAttribute = () => {
      // clear entity
      $scope.entity = {};
    }

    $scope.onUpdateAttribute = () => {
      var value = $scope.entity["attrValueEdit"];
      var key = $scope.entity["key"];

      // clear entity
      $scope.entity = {};

      // TODO: check if value changed

      // update the attribute on the mbean
      var mbean = workspace.getSelectedMBeanName();
      if (mbean) {
        jolokia.setAttribute(mbean, key, value,
          onSuccess((response) => {
              notification("success", "Updated attribute " + key);
            }
          ));
      }
    };

    $scope.onViewAttribute = (row) => {
      // create entity and populate it with data from the selected row
      $scope.entity = {};
      $scope.entity["key"] = row.key;
      $scope.entity["description"] = row.attrDesc;
      $scope.entity["type"] = row.type;
      $scope.entity["rw"] = row.rw;
      var type = asJsonSchemaType(row.type, row.key);
      var readOnly = !row.rw;

      // calculate a textare with X number of rows that usually fit the value to display
      var len = row.summary.length;
      var rows = (len / 40) + 1;
      if (rows > 10) {
        // cap at most 10 rows to not make the dialog too large
        rows = 10;
      }

      if (readOnly) {
        // if the value is empty its a &nbsp; as we need this for the table to allow us to click on the empty row
        if (row.summary === '&nbsp;') {
          $scope.entity["attrValueView"] = '';
        } else {
          $scope.entity["attrValueView"] = row.summary;
        }

        // clone from the basic schema to the new schema we create on-the-fly
        // this is needed as the dialog have problems if reusing the schema, and changing the schema afterwards
        // so its safer to create a new schema according to our needs
        $scope.attributeSchemaView = {};
        for (var i in attributeSchemaBasic) {
          $scope.attributeSchemaView[i] = attributeSchemaBasic[i];
        }

        // and add the new attrValue which is dynamic computed
        $scope.attributeSchemaView.properties.attrValueView = {
          description: 'Value',
          label: "Value",
          tooltip: 'Attribute value',
          type: 'string',
          formTemplate: "<textarea class='input-xlarge' rows='" + rows + "' readonly='true'></textarea>"
        }
        // just to be safe, then delete not needed part of the scema
        if ($scope.attributeSchemaView) {
          delete $scope.attributeSchemaView.properties.attrValueEdit;
        }
      } else {
        // if the value is empty its a &nbsp; as we need this for the table to allow us to click on the empty row
        if (row.summary === '&nbsp;') {
          $scope.entity["attrValueEdit"] = '';
        } else {
          $scope.entity["attrValueEdit"] = row.summary;
        }

        // clone from the basic schema to the new schema we create on-the-fly
        // this is needed as the dialog have problems if reusing the schema, and changing the schema afterwards
        // so its safer to create a new schema according to our needs
        $scope.attributeSchemaEdit = {};
        for (var i in attributeSchemaBasic) {
          $scope.attributeSchemaEdit[i] = attributeSchemaBasic[i];
        }
        // and add the new attrValue which is dynamic computed
        $scope.attributeSchemaEdit.properties.attrValueEdit = {
          description: 'Value',
          label: "Value",
          tooltip: 'Attribute value',
          type: 'string',
          formTemplate: "<textarea class='input-xlarge' rows='" + rows + "'></textarea>"
        }
        // just to be safe, then delete not needed part of the scema
        if ($scope.attributeSchemaEdit) {
          delete $scope.attributeSchemaEdit.properties.attrValueView;
        }
      }

      $scope.showAttributeDialog = true;
    }

    $scope.getDashboardWidgets = (row) => {
      var mbean = workspace.getSelectedMBeanName();
      if (!mbean) {
        return '';
      }
      var potentialCandidates = jmxWidgets.filter((widget) => {
        return mbean === widget.mbean;
      });

      if (potentialCandidates.isEmpty()) {
        return '';
      }

      potentialCandidates = potentialCandidates.filter((widget) => {
        return widget.attribute === row.key || widget.total === row.key;
      });

      if (potentialCandidates.isEmpty()) {
        return '';
      }

      var rc = [];
      potentialCandidates.forEach((widget) => {
        var widgetType = Jmx.getWidgetType(widget);
        rc.push("<i class=\"" + widgetType.icon + " clickable\" title=\"" + widgetType.title + "\" ng-click=\"addChartToDashboard(row.entity, '" + widgetType.type + "')\"></i>");

      });
      return rc.join() + "&nbsp;";
    };

    $scope.addChartToDashboard = (row, widgetType) => {
      var mbean = workspace.getSelectedMBeanName();
      var candidates = jmxWidgets.filter((widget) => {
        return mbean === widget.mbean;
      });

      candidates = candidates.filter((widget) => {
        return widget.attribute === row.key || widget.total === row.key;
      });

      candidates = candidates.filter((widget) => {
        return widget.type === widgetType;
      });

      // hmmm, we really should only have one result...
      var widget = candidates.first();
      var type = getWidgetType(widget);

      //console.log("widgetType: ", type, " widget: ", widget);

      $location.url(Jmx.createDashboardLink(type, widget));
    };

    /*
     * Returns the toolBar template HTML to use for the current selection
     */
    $scope.toolBarTemplate = () => {
      // lets lookup the list of helpers by domain
      var answer = Jmx.getAttributeToolBar(workspace.selection);

      // TODO - maybe there's a better way to determine when to enable selections

      /*
       if (answer.startsWith("app/camel") && workspace.selection.children.length > 0) {
       $scope.selectToggle.setSelect(true);
       } else {
       $scope.selectToggle.setSelect(false);
       }
       */
      return answer;
    };

    $scope.invokeSelectedMBeans = (operationName, completeFunction:() => any = null) => {
      var queries = [];
      angular.forEach($scope.selectedItems || [], (item) => {
        var mbean = item["_id"];
        if (mbean) {
          var opName = operationName;
          if (angular.isFunction(operationName)) {
            opName = operationName(item);
          }
          //console.log("Invoking operation " + opName + " on " + mbean);
          queries.push({type: "exec", operation: opName, mbean: mbean});
        }
      });
      if (queries.length) {
        var callback = () => {
          if (completeFunction) {
            completeFunction();
          } else {
            operationComplete();
          }
        };
        jolokia.request(queries, onSuccess(callback, {error: callback}));
      }
    };

    $scope.folderHref = (row) => {
      var key = row.getProperty("key");
      if (key) {
        return Core.createHref($location, "#" + $location.path() + "?nid=" + key, ["nid"]);
      } else {
        return "";
      }
    };

    $scope.folderIconClass = (row) => {
      // TODO lets ignore the classes property for now
      // as we don't have an easy way to know if there is an icon defined for an icon or not
      // and we want to make sure there always is an icon shown
      /*
       var classes = (row.getProperty("addClass") || "").trim();
       if (classes) {
       return classes;
       }
       */
      return row.getProperty("objectName") ? "icon-cog" : "icon-folder-close";
    };

    function operationComplete() {
      updateTableContents();
    }

    function updateTableContents() {
      // lets clear any previous queries just in case!
      Core.unregister(jolokia, $scope);

      $scope.gridData = [];
      $scope.mbeanIndex = null;
      var mbean = workspace.getSelectedMBeanName();
      var request = null;
      var node = workspace.selection;
      if (node === null || angular.isUndefined(node) || node.key !== $scope.lastKey) {
        // cache attributes info, so we know if the attribute is read-only or read-write, and also the attribute description
        $scope.attributesInfoCache = null;
        if (mbean) {
          var asQuery = (node) => {
            var path = escapeMBeanPath(node);
            var query = {
              type: "LIST",
              method: "post",
              path: path,
              ignoreErrors: true
            };
            return query;
          };
          var infoQuery = asQuery(mbean);
          jolokia.request(infoQuery, onSuccess((response) => {
            $scope.attributesInfoCache = response.value;
            log.debug("Updated attributes info cache for mbean " + mbean);
          }));
        }
      }

      if (mbean) {
        request = { type: 'read', mbean: mbean };
        if (node.key !== $scope.lastKey) {
          $scope.columnDefs = propertiesColumnDefs;
        }
      } else if (node) {
        if (node.key !== $scope.lastKey) {
          $scope.columnDefs = [];
        }
        // lets query each child's details
        var children = node.children;
        if (children) {
          var childNodes = children.map((child) => child.objectName);
          var mbeans = childNodes.filter((mbean) => mbean);
          if (mbeans) {
            var typeNames = Jmx.getUniqueTypeNames(children);
            if (typeNames.length <= 1) {
              var query = mbeans.map((mbean) => {
                return { type: "READ", mbean: mbean, ignoreErrors: true};
              });
              if (query.length > 0) {
                request = query;

                // deal with multiple results
                $scope.mbeanIndex = {};
                $scope.mbeanRowCounter = 0;
                $scope.mbeanCount = mbeans.length;
                //$scope.columnDefs = [];
              }
            } else {
              console.log("Too many type names " + typeNames);
            }
          }
        }
      }
      //var callback = onSuccess(render, { error: render });
      var callback = onSuccess(render);
      if (request) {
        $scope.request = request;
        Core.register(jolokia, $scope, request, callback);
      } else if (node) {
        if (node.key !== $scope.lastKey) {
          $scope.columnDefs = foldersColumnDefs;
        }
        $scope.gridData = node.children;
      }
      if (node) {
        $scope.lastKey = node.key;
      }
    }

    function render(response) {
      var data = response.value;
      var mbeanIndex = $scope.mbeanIndex;
      var mbean = response.request['mbean'];
      log.debug("mbean: ", mbean);
      if (mbean) {
        // lets store the mbean in the row for later
        data["_id"] = mbean;
      }
      if (mbeanIndex) {
        if (mbean) {

          var idx = mbeanIndex[mbean];
          if (!angular.isDefined(idx)) {
            idx = $scope.mbeanRowCounter;
            mbeanIndex[mbean] = idx;
            $scope.mbeanRowCounter += 1;
          }
          if (idx === 0) {
            // this is to force the table to repaint
            $scope.selectedIndices = $scope.selectedItems.map((item) => $scope.gridData.indexOf(item));
            $scope.gridData = [];

            if (!$scope.columnDefs.length) {
              // lets update the column definitions based on any configured defaults
              var key = workspace.selectionConfigKey();
              var defaultDefs = workspace.attributeColumnDefs[key] || [];
              var defaultSize = defaultDefs.length;
              var map = {};
              angular.forEach(defaultDefs, (value, key) => {
                var field = value.field;
                if (field) {
                  map[field] = value
                }
              });

              angular.forEach(data, (value, key) => {
                if (includePropertyValue(key, value)) {
                  if (!map[key]) {
                    defaultDefs.push({
                      field: key,
                      displayName: humanizeValue(key),
                      visible: defaultSize === 0
                    });
                  }
                }
              });
              $scope.columnDefs = defaultDefs;
            }
          }
          // assume 1 row of data per mbean
          $scope.gridData[idx] = data;

          var count = $scope.mbeanCount;
          if (!count || idx + 1 >= count) {
            // only cause a refresh on the last row
            var newSelections = $scope.selectedIndices.map((idx) => $scope.gridData[idx]).filter((row) => row);
            $scope.selectedItems.splice(0, $scope.selectedItems.length);
            $scope.selectedItems.push.apply($scope.selectedItems, newSelections);
            //console.log("Would have selected " + JSON.stringify($scope.selectedItems));
            Core.$apply($scope);
          }
          // if the last row, then fire an event
        } else {
          console.log("No mbean name in request " + JSON.stringify(response.request));
        }
      } else {
        $scope.columnDefs = propertiesColumnDefs;
        var showAllAttributes = true;
        if (angular.isObject(data)) {
          var properties = [];
          angular.forEach(data, (value, key) => {
            if (showAllAttributes || includePropertyValue(key, value)) {
              // always skip keys which start with _
              if (!key.startsWith("_")) {
                // lets format the ObjectName nicely dealing with objects with
                // nested object names or arrays of object names
                if (key === "ObjectName") {
                  value = unwrapObjectName(value);
                }
                // lets unwrap any arrays of object names
                if (angular.isArray(value)) {
                  value = value.map((v) => {
                    return unwrapObjectName(v);
                  });
                }
                var data = {key: key, name: humanizeValue(key), value: safeNull(value)};

                generateSummaryAndDetail(key, data);
                properties.push(data);
              }
            }
          });
          if (!properties.any((p) => {
            return p['key'] === 'ObjectName';
          })) {
            var objectName = {
              key: "ObjectName",
              name: "Object Name",
              value: mbean
            };
            generateSummaryAndDetail(objectName.key, objectName);
            properties.push(objectName);
          }
          properties = properties.sortBy("name");
          $scope.selectedItems = [data];
          data = properties;
        }
        $scope.gridData = data;
        // log.debug("gridData: ", $scope.gridData);
        Core.$apply($scope);
      }
    }

    function unwrapObjectName(value) {
      if (!angular.isObject(value)) {
        return value;
      }
      var keys = Object.keys(value);
      if (keys.length === 1 && keys[0] === "objectName") {
        return value["objectName"];
      }
      return value;
    }

    function generateSummaryAndDetail(key, data) {
      var value = data.value;
      if (!angular.isArray(value) && angular.isObject(value)) {
        var detailHtml = "<table class='table table-striped'>";
        var summary = "";
        var object = value;
        var keys = Object.keys(value).sort();
        angular.forEach(keys, (key) => {
          var value = object[key];
          detailHtml += "<tr><td>"
            + humanizeValue(key) + "</td><td>" + value + "</td></tr>";
          summary += "" + humanizeValue(key) + ": " + value + "  "
        });
        detailHtml += "</table>";
        data.summary = summary;
        data.detailHtml = detailHtml;
        data.tooltip = summary;
      } else {
        var text = value;
        // if the text is empty then use a no-break-space so the table allows us to click on the row,
        // otherwise if the text is empty, then you cannot click on the row
        if (text === '') {
          text = '&nbsp;';
          data.tooltip = "";
        } else {
          data.tooltip = text;
        }
        data.summary = "" + text + "";
        data.detailHtml = "<pre>" + text + "</pre>";
        if (angular.isArray(value)) {
          var html = "<ul>";
          angular.forEach(value, (item) => {
            html += "<li>" + item + "</li>";
          });
          html += "</ul>";
          data.detailHtml = html;
        }
      }

      // enrich the data with information if the attribute is read-only/read-write, and the JMX attribute description (if any)
      data.rw = false;
      data.attrDesc = data.name;
      data.type = "string";
      if ($scope.attributesInfoCache != null && 'attr' in $scope.attributesInfoCache) {
        var info = $scope.attributesInfoCache.attr[key];
        if (angular.isDefined(info)) {
          data.rw = info.rw;
          data.attrDesc = info.desc;
          data.type = info.type;
        }
      }
    }

    function includePropertyValue(key:string, value) {
      return !angular.isObject(value);
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
        if (lower === "boolean" || lower === "java.lang.boolean") {
          return "boolean";
        }
        if (lower === "string" || lower === "java.lang.String") {
          return "string";
        }
      }
      // fallback as string
      return "string";
    }

  }

}
