/**
 * @module DataTable
 * @main DataTable
 */
module DataTable {

  export var log:Logging.Logger = Logger.get("DataTable");

  export class SimpleDataTable {
    public restrict = 'A';

    public scope = {
      config: '=hawtioSimpleTable',
      target: '@',
      showFiles: '@'
    };

    public link:(scope, element, attrs) => any;

    constructor(public $compile) {
      // necessary to ensure 'this' is this object <sigh>
      this.link = ($scope, $element, $attrs) => {
        return this.doLink($scope, $element, $attrs);
      }
    }

    private doLink($scope, $element, $attrs) {
      var config = $scope.config;
      var dataName = config.data || "data";
      // need to remember which rows by index has been selected as the config.data / config.selectedItems
      // may not have any uuid we can use to know which was selected, and re-select them when the data is changed (refreshed)
      var selectedRowIds = [];
      $scope.rows = [];

      var scope = $scope.$parent || $scope;

      var listener = (otherValue) => {
        var value = Core.pathGet(scope, dataName);
        if (value && !angular.isArray(value)) {
          value = [value];
          Core.pathSet(scope, dataName, value);
        }

        // enrich the rows with information about their index
        var idx = -1;
        $scope.rows = (value || []).map(entity => {
          idx++;
          return {
            entity: entity,
            index: idx,
            selected: selectedRowIds.indexOf(idx) >= 0,
            getProperty: (name) => {
              return entity[name];
            }
          };
        });

        // re-select selected rows in the config.selectedItems
        config.selectedItems = [];
        $scope.rows.forEach(row => {
          if (row.selected) {
            config.selectedItems.push(row.entity);
          }
        })
      };

     scope.$watch(dataName, listener);

      // lets add a separate event so we can force updates
      // if we find cases where the delta logic doesn't work
      // (such as for nested hawtioinput-input-table)
      scope.$on("hawtio.datatable." + dataName, listener);

      function getSelectionArray() {
        var selectionArray = config.selectedItems;
        if (!selectionArray) {
          selectionArray = [];
          config.selectedItems = selectionArray;
        }
        if (angular.isString(selectionArray)) {
          var name = selectionArray;
          selectionArray =  Core.pathGet(scope, name);
          if (!selectionArray) {
            selectionArray = [];
            scope[name] = selectionArray;
          }
        }
        return selectionArray;
      }

      function isMultiSelect() {
        var multiSelect = $scope.config.multiSelect;
        if (angular.isUndefined(multiSelect)) {
          multiSelect = true;
        }
        return multiSelect;
      }

      $scope.toggleAllSelections = () => {
        var allRowsSelected = $scope.config.allRowsSelected;
        var newFlag = allRowsSelected;
        var selectionArray = getSelectionArray();
        selectionArray.splice(0, selectionArray.length);
        angular.forEach($scope.rows, (row) => {
          row.selected = newFlag;
          if (allRowsSelected) {
            selectionArray.push(row.entity);
          }
        });
      };

      $scope.toggleRowSelection = (row) => {
        if (row) {
          var selectionArray = getSelectionArray();
          if (!isMultiSelect()) {
            // lets clear all other selections
            selectionArray.splice(0, selectionArray.length);
            angular.forEach($scope.rows, (r) => {
              if (r !== row) {
                r.selected = false;
              }
            });
          }
          var entity = row.entity;
          if (entity) {
            var idx = selectionArray.indexOf(entity);
            if (row.selected) {
              if (idx < 0) {
                selectionArray.push(entity);
              }
            } else {
              // clear the all selected checkbox
              $scope.config.allRowsSelected = false;
              if (idx >= 0) {
                selectionArray.splice(idx, 1);
              }
            }
          }
        }
      };

      $scope.isSelected = (row) => {
        return selectedRowIds.indexOf(row.index) >= 0;
      }

      $scope.onRowSelected = (row) => {
        // are we already selected?
        var idx = selectedRowIds.indexOf(row.index);
        if (idx >= 0) {
          delete selectedRowIds[idx];
          delete config.selectedItems[row.entity];
        } else {
          if (!config.multiSelect) {
            selectedRowIds = [];
            config.selectedItems = [];
          }
          selectedRowIds.push(row.index);
          config.selectedItems.push(row.entity);
        }
      }

      // lets add the header and row cells
      var rootElement = $($element);
      rootElement.children().remove();

      var showCheckBox = firstValueDefined(config, ["showSelectionCheckbox", "displaySelectionCheckbox"], true);
      var enableRowClickSelection = firstValueDefined(config, ["enableRowClickSelection"], false);

      var onMouseDown;
      if (enableRowClickSelection) {
        onMouseDown = "ng-mousedown='onRowSelected(row)' ";
      } else {
        onMouseDown = "";
      }
      var headHtml = "<thead><tr>";
      var bodyHtml = "<tbody><tr ng-repeat='row in rows | filter:config.filterOptions.filterText' " + onMouseDown + "ng-class=\"{'selected': isSelected(row)}\" >";
      var idx = 0;
      if (showCheckBox) {
        var toggleAllHtml = isMultiSelect() ?
          "<input type='checkbox' ng-show='rows.length' ng-model='config.allRowsSelected' ng-change='toggleAllSelections()'>" : "";

        headHtml += "\n<th>" +
          toggleAllHtml +
          "</th>"
        bodyHtml += "\n<td><input type='checkbox' ng-model='row.selected' ng-change='toggleRowSelection(row)'></td>"
      }
      angular.forEach(config.columnDefs, (colDef) => {
        var field = colDef.field;
        var cellTemplate = colDef.cellTemplate || '<div class="ngCellText" title="{{row.entity.' + field + '}}">{{row.entity.' + field + '}}</div>';

        headHtml += "\n<th>{{config.columnDefs[" + idx + "].displayName}}</th>"
        bodyHtml += "\n<td>" + cellTemplate + "</td>"
        idx += 1;
      });
      var html = headHtml + "\n</tr></thead>\n" +
        bodyHtml + "\n</tr></tbody>";

      var newContent = this.$compile(html)($scope);
      rootElement.html(newContent);
    }

  }

  /**
   * Returns the first property value defined in the given object or the default value if none are defined
   *
   * @param object the object to look for properties
   * @param names the array of property names to look for
   * @param defaultValue the value if no property values are defined
   * @return {*} the first defined property value or the defaultValue if none are defined
   */
  function firstValueDefined(object, names, defaultValue) {
    var answer = defaultValue;
    var found = false;
    angular.forEach(names, (name) => {
      var value = object[name];
      if (!found && angular.isDefined(value)) {
        answer = value;
        found = true;
      }
    });
    return answer;
  }
}