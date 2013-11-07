module Jmx {

  export var propertiesColumnDefs = [
    {field: 'name', displayName: 'Property', width: "27%",
      cellTemplate: '<div class="ngCellText"><div class="inline" compile="getDashboardWidgets(row.entity)"></div>{{row.entity.name}}</div>'},
    {field: 'value', displayName: 'Value',  width: "70%",
      cellTemplate: '<div class="ngCellText" ng-click="openDetailView(row.entity)" ng-bind-html-unsafe="row.entity.summary"></div>'
    }
  ];

  export var foldersColumnDefs = [{
      displayName: 'Name',
      cellTemplate: '<div class="ngCellText"><a href="{{folderHref(row)}}"><i class="{{folderIconClass(row)}}"></i> {{row.getProperty("title")}}</a></div>'
    }];

  export function AttributesController($scope, $location, workspace:Workspace, jolokia, jmxWidgets, jmxWidgetTypes) {
    $scope.searchText = '';
    $scope.columnDefs = [];
    $scope.selectedItems = [];
    $scope.selectCheckBox = true;

    $scope.valueDetails = new Core.Dialog();

    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      //plugins: [$scope.selectToggle],
      showFilter: false,
      //showColumnMenu: false,
      canSelectRows: false,
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

    /**
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

    $scope.invokeSelectedMBeans = (operationName, completeFunction: () => any = null) => {
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

    $scope.openDetailView = (entity) => {
      $scope.row = entity;
      if (entity.detailHtml) {
        $scope.valueDetails.open();
      }
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
                  value = value.map((v) => { return unwrapObjectName(v); });
                }
                var data = {key: key, name: humanizeValue(key), value: safeNull(value)};

                generateSummaryAndDetail(data);
                properties.push(data);
              }
            }
          });
          if (!properties.any((p) => { return p['key'] === 'ObjectName'; })) {
            var objectName = {
              key: "ObjectName",
              name: "Object Name",
              value: mbean
            };
            generateSummaryAndDetail(objectName);
            properties.push(objectName);
          }
          properties = properties.sortBy("name");
          $scope.selectedItems = [data];
          data = properties;
        }
        $scope.gridData = data;
        log.debug("gridData: ", $scope.gridData);
        Core.$apply($scope);
      }
    }

    function unwrapObjectName(value) {
      var keys = Object.keys(value);
      if (keys.length === 1 && keys[0] === "objectName") {
        return value["objectName"];
      }
      return value;
    }

    function generateSummaryAndDetail(data) {
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
      } else {
        // TODO can we format any nicer?
        var text = value;
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
    }

    function includePropertyValue(key: string, value) {
      return !angular.isObject(value);
    }
  }

}
