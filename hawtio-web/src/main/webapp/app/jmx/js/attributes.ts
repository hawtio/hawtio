/**
 * @module Jmx
 */
/// <reference path="./jmxPlugin.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
module Jmx {

  export var propertiesColumnDefs = [
    {
      field: 'name',
      displayName: 'Property',
      width: "27%",
      cellTemplate: '<div class="ngCellText" title="{{row.entity.attrDesc}}" ' +
        'data-placement="bottom"><div ng-show="!inDashboard" class="inline" compile="row.entity.getDashboardWidgets()"></div><a href="" ng-click="row.entity.onViewAttribute()">{{row.entity.name}}</a></div>'},
    {
      field: 'value',
      displayName: 'Value',
      width: "70%",
      cellTemplate: '<div class="ngCellText mouse-pointer" ng-click="row.entity.onViewAttribute()" title="{{row.entity.tooltip}}" ng-bind-html-unsafe="row.entity.summary"></div>'
    }
  ];

  export var foldersColumnDefs = [
    {
      displayName: 'Name',
      cellTemplate: '<div class="ngCellText"><a href="{{row.entity.folderHref(row)}}"><i class="{{row.entity.folderIconClass(row)}}"></i> {{row.getProperty("title")}}</a></div>'
    }
  ];

  export var AttributesController = _module.controller("Jmx.AttributesController", ["$scope", "$element", "$location", "workspace", "jolokia", "jmxWidgets", "jmxWidgetTypes", "$templateCache", "localStorage", "$browser", (
      $scope,
      $element,
      $location,
      workspace: Workspace,
      jolokia: Jolokia.IJolokia,
      jmxWidgets,
      jmxWidgetTypes,
      $templateCache: ng.ITemplateCacheService,
      localStorage: WindowLocalStorage,
      $browser) => {

    $scope.searchText = '';
    $scope.nid = 'empty';
    $scope.selectedItems = [];

    $scope.lastKey = null;
    $scope.attributesInfoCache = {};

    $scope.entity = {};
    $scope.attributeSchema = {};
    $scope.gridData = [];
    $scope.attributes = "";

    $scope.$watch('gridData.length', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue > 0) {
          $scope.attributes = $templateCache.get('gridTemplate');
        } else {
          $scope.attributes = "";
        }
      }
    });

    var attributeSchemaBasic = {
      properties: {
        'key': {
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
          tooltip: 'Attribute type',
          type: 'string',
          readOnly: 'true'
        },
        'jolokia': {
          tooltip: 'Jolokia REST URL',
          type: 'string',
          readOnly: 'true'
        }
      }
    };

    $scope.gridOptions = {
      scope: $scope,
      selectedItems: [],
      showFilter: false,
      canSelectRows: false,
      enableRowSelection: false,
      enableRowClickSelection: false,
      keepLastSelected: false,
      multiSelect: true,
      showColumnMenu: true,
      displaySelectionCheckbox: false,
      filterOptions: {
        filterText: ''
      },
      // TODO disabled for now as it causes https://github.com/hawtio/hawtio/issues/262
      //sortInfo: { field: 'name', direction: 'asc'},
      data: 'gridData',
      columnDefs: propertiesColumnDefs
    };

    $scope.$watch(function($scope) {
      return $scope.gridOptions.selectedItems.map(function(item) {
        return item.key || item;
      });
    }, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("Selected items: ", newValue);
        $scope.selectedItems = newValue;
      }
    }, true);

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress

      // clear selection if we clicked the jmx nav bar button
      // otherwise we may show data from Camel/ActiveMQ or other plugins that
      // reuse the JMX plugin for showing tables (#884)
      var currentUrl = $location.url();
      if (currentUrl.endsWith("/jmx/attributes")) {
        log.debug("Reset selection in JMX plugin");
        workspace.selection = null;
        $scope.lastKey = null;
      }
      $scope.nid = $location.search()['nid'];
      log.debug("nid: ", $scope.nid);

      pendingUpdate = setTimeout(updateTableContents, 50);
    });

    $scope.$on('jmxTreeUpdated', function () {
      Core.unregister(jolokia, $scope);
      if (pendingUpdate) {
        clearTimeout(pendingUpdate);
      }
      pendingUpdate = setTimeout(updateTableContents, 500);
    });

    var pendingUpdate = null;

    $scope.$watch('gridOptions.filterOptions.filterText', (newValue, oldValue) => {
      Core.unregister(jolokia, $scope);
      if (pendingUpdate) {
        clearTimeout(pendingUpdate);
      }
      pendingUpdate = setTimeout(updateTableContents, 500);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) {
        Core.unregister(jolokia, $scope);
        return;
      }
      if (pendingUpdate) {
        clearTimeout(pendingUpdate);
      }
      pendingUpdate = setTimeout(() => {
        $scope.gridData = [];
        Core.$apply($scope);
        setTimeout(updateTableContents, 10);
      }, 10);
    });

    $scope.hasWidget = (row) => {
      return true;
    };

    $scope.onCancelAttribute = () => {
      // clear entity
      $scope.entity = {};
    };

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
              Core.notification("success", "Updated attribute " + key);
            }
          ));
      }
    };

    $scope.onViewAttribute = (row) => {
      if (!row.summary) {
        return;
      }
      // create entity and populate it with data from the selected row
      $scope.entity = {};
      $scope.entity["key"] = row.key;
      $scope.entity["description"] = row.attrDesc;
      $scope.entity["type"] = row.type;

      var mbean = escapeMBean(workspace.getSelectedMBeanName());
      var url = $location.protocol() + "://" + $location.host() + ":" + $location.port() + $browser.baseHref();
      $scope.entity["jolokia"] = url + localStorage["url"] + "/read/" + mbean + "/" + $scope.entity["key"] ;
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
        };
        // just to be safe, then delete not needed part of the schema
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
        };
        // just to be safe, then delete not needed part of the schema
        if ($scope.attributeSchemaEdit) {
          delete $scope.attributeSchemaEdit.properties.attrValueView;
        }
      }

      $scope.showAttributeDialog = true;
    };

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

      row.addChartToDashboard = (type) => {
        $scope.addChartToDashboard(row, type);
      };

      var rc = [];
      potentialCandidates.forEach((widget) => {
        var widgetType = Jmx.getWidgetType(widget);
        rc.push("<i class=\"" + widgetType['icon'] + " clickable\" title=\"" + widgetType['title'] + "\" ng-click=\"row.entity.addChartToDashboard('" + widgetType['type'] + "')\"></i>");

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
      if (!row.getProperty) {
        return "";
      }
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
      if (!row.getProperty) {
        return "";
      }
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
      var request = <any>null;
      var node = workspace.selection;
      if (node === null || angular.isUndefined(node) || node.key !== $scope.lastKey) {
        // cache attributes info, so we know if the attribute is read-only or read-write, and also the attribute description
        $scope.attributesInfoCache = null;

        if(mbean == null) {
          // in case of refresh
          var _key = $location.search()['nid'];
          var _node = workspace.keyToNodeMap[_key];
          if (_node) {
            mbean = _node.objectName;
          }
        }

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
        if (node === null || angular.isUndefined(node) || node.key !== $scope.lastKey) {
          $scope.gridOptions.columnDefs = propertiesColumnDefs;
          $scope.gridOptions.enableRowClickSelection = false;
        }
      } else if (node) {
        if (node.key !== $scope.lastKey) {
          $scope.gridOptions.columnDefs = [];
          $scope.gridOptions.enableRowClickSelection = true;
        }
        // lets query each child's details
        var children = node.children;
        if (children) {
          var childNodes = children.map((child) => child.objectName);
          var mbeans = childNodes.filter((mbean) => FilterHelpers.search(mbean, $scope.gridOptions.filterOptions.filterText));
          var maxFolderSize = localStorage["jmxMaxFolderSize"];
          mbeans = mbeans.slice(0, maxFolderSize);
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
          $scope.gridOptions.columnDefs = foldersColumnDefs;
          $scope.gridOptions.enableRowClickSelection = true;
        }
        $scope.gridData = node.children;
        addHandlerFunctions($scope.gridData);
      }
      if (node) {
        $scope.lastKey = node.key;
      }
      Core.$apply($scope);
    }

    function render(response) {
      var data = response.value;
      var mbeanIndex = $scope.mbeanIndex;
      var mbean = response.request['mbean'];

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

            if (!$scope.gridOptions.columnDefs.length) {
              // lets update the column definitions based on any configured defaults

              var key = workspace.selectionConfigKey();
              $scope.gridOptions.gridKey = key;
              $scope.gridOptions.onClickRowHandlers = workspace.onClickRowHandlers;
              var defaultDefs = workspace.attributeColumnDefs[key] || [];
              var defaultSize = defaultDefs.length;
              var map = {};
              angular.forEach(defaultDefs, (value, key) => {
                var field = value.field;
                if (field) {
                  map[field] = value
                }
              });

              var extraDefs = [];
              angular.forEach(data, (value, key) => {
                if (includePropertyValue(key, value)) {
                  if (!map[key]) {
                    extraDefs.push({
                      field: key,
                      displayName: key === '_id' ? 'Object name' : Core.humanizeValue(key),
                      visible: defaultSize === 0
                    });
                  }
                }
              });

              // the additional columns (which are not pre-configured), should be sorted
              // so the column menu has a nice sorted list instead of random ordering
              extraDefs = extraDefs.sort((def, def2) => {
                // make sure _id is last
                if (def.field.startsWith('_')) {
                  return 1;
                } else if (def2.field.startsWith('_')) {
                  return -1;
                }
                return def.field.localeCompare(def2.field);
              });
              extraDefs.forEach(e => {
                defaultDefs.push(e);
              });

              $scope.gridOptions.columnDefs = defaultDefs;
              $scope.gridOptions.enableRowClickSelection = true;
            }
          }
          // mask attribute read error
          angular.forEach(data, (value, key) => {
            if (includePropertyValue(key, value)) {
              data[key] = maskReadError(value);
            }
          });
          // assume 1 row of data per mbean
          $scope.gridData[idx] = data;
          addHandlerFunctions($scope.gridData);

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
        $scope.gridOptions.columnDefs = propertiesColumnDefs;
        $scope.gridOptions.enableRowClickSelection = false;
        var showAllAttributes = true;
        if (angular.isObject(data)) {
          var properties = Array();
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
                // the value must be string as the sorting/filtering of the table relies on that
                var type = lookupAttributeType(key);
                var data = {
                  key: key,
                  name: Core.humanizeValue(key),
                  value: maskReadError(safeNullAsString(value, type))
                };

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
        addHandlerFunctions($scope.gridData);
        Core.$apply($scope);
      }
    }

    function maskReadError(value) {
      if (typeof value !== 'string') {
        return value;
      }
      var forbidden = /^ERROR: Reading attribute .+ \(class java\.lang\.SecurityException\)$/;
      var unsupported = /^ERROR: java\.lang\.UnsupportedOperationException: .+ \(class javax\.management\.RuntimeMBeanException\)$/;
      if (value.match(forbidden)) {
        return "**********";
      } else if (value.match(unsupported)) {
        return "(Not supported)";
      } else {
        return value;
      }
    }

    function addHandlerFunctions(data) {
      data.forEach((item) => {
        item['inDashboard'] = $scope.inDashboard;
        item['getDashboardWidgets'] = () => {
          return $scope.getDashboardWidgets(item);
        };
        item['onViewAttribute'] = () => {
          $scope.onViewAttribute(item);
        };
        item['folderIconClass'] = (row) => {
          return $scope.folderIconClass(row);
        };
        item['folderHref'] = (row) => {
          return $scope.folderHref(row);
        };
      });
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
      var value = Core.escapeHtml(data.value);
      if (!angular.isArray(value) && angular.isObject(value)) {
        var detailHtml = "<table class='table table-striped'>";
        var summary = "";
        var object = value;
        var keys = Object.keys(value).sort();
        angular.forEach(keys, (key) => {
          var value = object[key];
          detailHtml += "<tr><td>"
            + Core.humanizeValue(key) + "</td><td>" + value + "</td></tr>";
          summary += "" + Core.humanizeValue(key) + ": " + value + "  "
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

    function lookupAttributeType(key) {
      if ($scope.attributesInfoCache != null && 'attr' in $scope.attributesInfoCache) {
        var info = $scope.attributesInfoCache.attr[key];
        if (angular.isDefined(info)) {
          return info.type;
        }
      }
      return null;
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

  }]);

}
