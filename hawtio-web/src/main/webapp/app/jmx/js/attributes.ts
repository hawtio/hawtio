module Jmx {

  export var propertiesColumnDefs = [
    {field: 'name', displayName: 'Property' /*, width: "20%"*/},
            {field: 'value', displayName: 'Value' /*,  width: "70%"*/}
          ];

  export function AttributesController($scope, workspace:Workspace, jolokia) {
    $scope.searchText = "";
    $scope.columnDefs = [];
    $scope.selectedItems = [];
    $scope.selectCheckBox = true;
    $scope.gridOptions = {
      selectedItems: $scope.selectedItems,
      showFilter: false,
      filterOptions: {
        filterText: "searchText"
      },
      data: 'gridData',
      columnDefs: 'columnDefs'
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateTableContents();
    });

    function operationComplete() {
      updateTableContents();
    }

    /**
     * Returns the toolBar template HTML to use for the current selection
     */
    $scope.toolBarTemplate = () => {
      // lets lookup the list of helpers by domain
      return Jmx.getAttributeToolBar(workspace.selection);
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
        jolokia.request(queries, onSuccess(callback));
      }
    };

    function updateTableContents() {
      $scope.gridData = [];
      $scope.mbeanIndex = null;
      var mbean = workspace.getSelectedMBeanName();
      var request = null;
      var node = workspace.selection;

      if (mbean) {
        request = { type: 'read', mbean: mbean };
        $scope.columnDefs = propertiesColumnDefs;
        setSelectable(false);
      } else if (node) {
        $scope.columnDefs = null;
        setSelectable(true);
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
              if (query.length === 1) {
                request = query[0];
              } else if (query.length > 1) {
                request = query;

                // deal with multiple results
                $scope.mbeanIndex = {};
                $scope.mbeanRowCounter = 0;
                $scope.mbeanCount = mbeans.length;
                $scope.columnDefs = [];
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
        // lets clear any previous queries
        Core.unregister(jolokia, $scope);
        Core.register(jolokia, $scope, request, callback);
      }
    }

    function render(response) {
      var data = response.value;
      var mbeanIndex = $scope.mbeanIndex;
      var mbean = response.request.mbean;
      if (mbean) {
          // lets store the mbean in the row for later
          data["_id"] = mbean;
      }
      if (mbeanIndex) {
        setSelectable(true);
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
            $scope.$apply();
          }
          // if the last row, then fire an event
        } else {
          console.log("No mbean name in request " + JSON.stringify(response.request));
        }
      } else {
        $scope.columnDefs = propertiesColumnDefs;
        if (angular.isObject(data)) {
          var properties = [];
          angular.forEach(data, (value, key) => {
            if (includePropertyValue(key, value)) {
              properties.push({name: humanizeValue(key), value: value});
            }
          });
          $scope.selectedItems = [data];
          data = properties;
        }
        $scope.gridData = data;
        console.log("Selectable items size " + $scope.selectedItems.length);
        setSelectable(false);

        $scope.$apply();
      }
    }

    function setSelectable(flag) {
      // TODO is there a way to update ng-grid to hide the selection checkbox
      // if we decide we don't want it?
/*
      $scope.gridOptions.displaySelectionCheckbox = flag;
      $scope.gridOptions.canSelectRows = flag;
*/
    }

    function includePropertyValue(key: string, value) {
      return !angular.isObject(value) && !key.startsWith("_");
    }
  }

}
