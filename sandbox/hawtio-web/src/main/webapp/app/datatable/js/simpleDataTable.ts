/// <reference path="datatablePlugin.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
/**
 * @module DataTable
 */
module DataTable {

  import isBlank = Core.isBlank;
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

      var defaultPrimaryKeyFn = (entity, idx) => {
        // default function to use id/_id/name as primary key, and fallback to use index
        return entity["id"] || entity["_id"] || entity["name"] || idx;
      };

      var config = $scope.config;

      var dataName = config.data || "data";
      // need to remember which rows has been selected as the config.data / config.selectedItems
      // so we can re-select them when data is changed/updated, and entity may be new instances
      // so we need a primary key function to generate a 'primary key' of the entity
      var primaryKeyFn = config.primaryKeyFn || defaultPrimaryKeyFn;
      $scope.rows = [];

      var scope = $scope.$parent || $scope;

      var listener = (otherValue) => {
        var value = Core.pathGet(scope, dataName);
        if (value && !angular.isArray(value)) {
          value = [value];
          Core.pathSet(scope, dataName, value);
        }

        if (!('sortInfo' in config) && 'columnDefs' in config) {
          // an optional defaultSort can be used to indicate a column
          // should not automatic be the default sort
          var ds = config.columnDefs.first()['defaultSort'];
          var sortField;
          if (angular.isUndefined(ds) || ds === true) {
            sortField = config.columnDefs.first()['field'];
          } else {
            sortField = config.columnDefs.slice(1).first()['field']
          }
          config['sortInfo'] = {
            sortBy: sortField,
            ascending: true
          }
        }

        var sortInfo = $scope.config.sortInfo;

        // Set null fields to empty string as sugar sortBy doesn't handle them correctly
        for (var rowKey in value) {
          var row = value[rowKey];
          for (var fieldKey in row) {
            var field = row[fieldKey];
            if (field === null) {
              value[rowKey][fieldKey] = "";
            }
          }
        }

        // enrich the rows with information about their index
        var idx = -1;
        $scope.rows = (value || []).sortBy(sortInfo.sortBy, !sortInfo.ascending).map(entity => {
          idx++;
          return {
            entity: entity,
            index: idx,
            getProperty: (name) => {
              return entity[name];
            }
          };
        });

        Core.pathSet(scope, ['hawtioSimpleTable', dataName, 'rows'], $scope.rows);

        // okay the data was changed/updated so we need to re-select previously selected items
        // and for that we need to evaluate the primary key function so we can match new data with old data.
        var reSelectedItems = [];
        $scope.rows.forEach((row, idx) => {
          var rpk = primaryKeyFn(row.entity, row.index);
          var selected = config.selectedItems.some(s => {
            var spk = primaryKeyFn(s, s.index);
            return angular.equals(rpk, spk);
          });
          if (selected) {
            // need to enrich entity with index, as we push row.entity to the re-selected items
            row.entity.index = row.index;
            reSelectedItems.push(row.entity);
            log.debug("Data changed so keep selecting row at index " + row.index);
          }
        });
        config.selectedItems = reSelectedItems;
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

      $scope.sortBy = (field) => {
        if ($scope.config.sortInfo.sortBy === field) {
          $scope.config.sortInfo.ascending = !$scope.config.sortInfo.ascending;
        } else {
          $scope.config.sortInfo.sortBy = field;
          $scope.config.sortInfo.ascending = true;
        }
        $scope.$emit("hawtio.datatable." + dataName);
      };

      $scope.getClass = (field) => {
        if ('sortInfo' in $scope.config) {
          if ($scope.config.sortInfo.sortBy === field) {
            if ($scope.config.sortInfo.ascending) {
              return 'asc';
            } else {
              return 'desc';
            }
          }
        }

        return '';
      };

      $scope.showRow = (row) => {
        var filter = Core.pathGet($scope, ['config', 'filterOptions', 'filterText']);
        if (Core.isBlank(filter)) {
          return true;
        }

        var data = null;

        // it may be a node selection (eg JMX plugin with Folder tree structure) then use the title
        try {
            data = row['entity']['title'];
        } catch (e) {
          // ignore
        }

        if (!data) {
          // use the row as-is
          data = row.entity;
        }

        var match = FilterHelpers.search(data, filter);
        return match;
      };

      $scope.isSelected = (row) => {
        return (row) && config.selectedItems.some(s => {
              var spk = primaryKeyFn(s, s.index);
              var rpk = primaryKeyFn(row.entity, row.index);
              return angular.equals(spk, rpk);
            });
      };

      $scope.onRowClicked = (row) => {
        var id = $scope.config.gridKey;
        if(id){
            var func = $scope.config.onClickRowHandlers[id];
            if(func) {
                func(row);
            }
        }
      };

      $scope.onRowSelected = (row) => {
        var idx = config.selectedItems.indexOf(row.entity);
        if (idx >= 0) {
          log.debug("De-selecting row at index " + row.index);
          config.selectedItems.splice(idx, 1);
        } else {
          if (!config.multiSelect) {
            config.selectedItems.length = 0;
          }
          log.debug("Selecting row at index " + row.index);
          // need to enrich entity with index, as we push row.entity to the selected items
          row.entity.index = row.index;
          config.selectedItems.push(row.entity);
        }
      };

      // lets add the header and row cells
      var rootElement = $element;
      rootElement.empty();

      var showCheckBox = firstValueDefined(config, ["showSelectionCheckbox", "displaySelectionCheckbox"], true);
      var enableRowClickSelection = firstValueDefined(config, ["enableRowClickSelection"], false);

      var onMouseDown;
      if (enableRowClickSelection) {
        onMouseDown = "ng-mousedown='onRowSelected(row)' ";
      } else {
        onMouseDown = "";
      }
      var headHtml = "<thead><tr>";
      // use a function to check if a row is selected so the UI can be kept up to date asap
      var bodyHtml = "<tbody><tr ng-repeat='row in rows track by $index' ng-show='showRow(row)' ng-click='onRowClicked(row)'" + onMouseDown + "ng-class=\"{'selected': isSelected(row)}\" >";
      var idx = 0;
      if (showCheckBox) {
        var toggleAllHtml = isMultiSelect() ?
          "<input type='checkbox' ng-show='rows.length' ng-model='config.allRowsSelected' ng-change='toggleAllSelections()'>" : "";

        headHtml += "\n<th class='simple-table-checkbox'>" +
          toggleAllHtml +
          "</th>"
        bodyHtml += "\n<td class='simple-table-checkbox'><input type='checkbox' ng-model='row.selected' ng-change='toggleRowSelection(row)'></td>"
      }
      angular.forEach(config.columnDefs, (colDef) => {
        var field = colDef.field;
        var cellTemplate = colDef.cellTemplate || '<div class="ngCellText" title="{{row.entity.' + field + '}}">{{row.entity.' + field + '}}</div>';
        var sortable = colDef.sortable;

        headHtml += "\n<th class='clickable no-fade table-header'";
        if (isBlank(sortable) || sortable) {
          headHtml += "ng-click=\"sortBy('" + field + "')\"";
        }
        headHtml += "ng-class=\"getClass('" + field + "')\">{{config.columnDefs[" + idx + "].displayName}}<span class='indicator'></span></th>";

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

  _module.directive('hawtioSimpleTable', ["$compile", ($compile) => new DataTable.SimpleDataTable($compile)]);

}

