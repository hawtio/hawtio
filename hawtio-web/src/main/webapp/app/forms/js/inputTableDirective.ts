module Forms {

  export class InputTableConfig {

    public name = 'form';
    public method = 'post';

    // the name of the attribute in the scope which is the data to be editted
    public entity = 'entity';

    // the name of the attribute in the scope which is the table configuration
    public tableConfig = 'tableConfig';

    // set to 'view' or 'create' for different modes
    public mode = 'edit';

    // the definition of the form
    public data:any = {};
    public json:any = undefined;

    public properties = [];
    public action = '';

    public tableclass = 'table table-striped inputTable';
    public controlgroupclass = 'control-group';
    public controlclass = 'controls pull-right';
    public labelclass = 'control-label';

    public showtypes = 'true';

    public removeicon = 'icon-remove';
    public editicon = 'icon-edit';
    public addicon = 'icon-plus';

    public removetext = 'Remove';
    public edittext = 'Edit';
    public addtext = 'Add';

    public onadd = 'onadd';
    public onedit = 'onedit';
    public onremove = 'onRemove';

    // TODO - add toggles to turn off add or edit buttons

    public getTableConfig() {
      return this.tableConfig || "tableConfig";
    }
  }

  export class InputTable {

    public restrict = 'A';
    public scope = true;
    public replace = true;
    public transclude = true;

    private attributeName = 'hawtioInputTable';

    // see constructor for why this is here...
    public link:(scope, element, attrs) => any;

    constructor(private workspace, public $compile) {
      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }
    }

    private doLink(scope, element, attrs) {
      var config = new InputTableConfig;

      var configName = attrs[this.attributeName];
      var tableConfig = Core.pathGet(scope, configName);
      config = configure(config, tableConfig, attrs);

      var entityName = attrs["entity"] || config.data || "entity";
      var propertyName = attrs["property"] || "arrayData";
      var entityPath = entityName + "." + propertyName;

      // TODO better name?
      var tableName = config["title"] || entityName;

      if (angular.isDefined(config.json)) {
        config.data = $.parseJSON(config.json);
      } else {
        config.data = scope[config.data];
      }

      scope.selectedItems = [];

      var div = $("<div></div>");

      // TODO lets ensure we have some default columns in the column configuration?
      var tableConfig = Core.pathGet(scope, configName);
      if (!tableConfig) {
        console.log("No table configuration for table " + tableName);
      } else {
        tableConfig["selectedItems"] = scope.selectedItems;
      }

      var table = this.createTable(config, configName);

      var group = this.getControlGroup(config, {}, "");
      var controlDiv = this.getControlDiv(config);
      controlDiv.addClass('btn-group');
      group.append(controlDiv);

      function updateData(action) {
        var data = Core.pathGet(scope, entityPath);
        // lets coerce the data to an array if its empty or an object
        if (!data) {
          data = [];
        }
        if (!angular.isArray(data) && data) {
          data = [data];
        }
        data = action(data);
        Core.pathSet(scope, entityPath, data);

        // TODO for some reason this doesn't notify the underlying hawtio-datatable that the table has changed
        // so lets force it with a notify...
        scope.$emit("hawtio.datatable." + entityPath, data);
        Core.$apply(scope);
      }

      function removeSelected(data) {
        angular.forEach(scope.selectedItems, (selected) => {
          var id = selected["_id"];
          if (angular.isArray(data)) {
            data = data.remove((value) => Object.equal(value, selected));
            delete selected["_id"];
            data = data.remove((value) => Object.equal(value, selected));
          }
          else {
            delete selected["_id"];
            if (id) {
              delete data[id];
            } else {
              // lets iterate for the value
              var found = false;
              angular.forEach(data, (value, key) => {
                if (!found && (Object.equal(value, selected))) {
                  console.log("Found row to delete! " + key);
                  delete data[key];
                  found = true;
                }
              });
              if (!found) {
                console.log("Could not find " + JSON.stringify(selected) + " in " + JSON.stringify(data));
              }
            }
          }
        });
        return data;
      }

      var add = null;
      var edit = null;
      var remove = null;
      var addDialog = null;
      var editDialog = null;
      var readOnly = attrs["readonly"];
      if (!readOnly) {
        var property = null;
        var dataName = attrs["data"];
        var dataModel = dataName ? Core.pathGet(scope, dataName) : null;
        var schemaName = attrs["schema"] || dataName;
        var schema = schemaName ? Core.pathGet(scope, schemaName) : null;
        if (propertyName && dataModel) {
          property = Core.pathGet(dataModel, ["properties", propertyName]);
        }

        add = this.getAddButton(config);

        scope.addDialogOptions = {
          backdropFade: true,
          dialogFade:true
        };
        scope.showAddDialog = false;

        scope.openAddDialog = () => {
          // lets lazily create the add dialog
          scope.addEntity = {};
          scope.addFormConfig = Forms.findArrayItemsSchema(property, schema);

          var childDataModelName = "addFormConfig";
          if (!addDialog) {
            var title = "Add " + tableName;
            addDialog = $('<div modal="showAddDialog" close="closeAddDialog()" options="addDialogOptions">\n' +
              '<div class="modal-header"><h4>' + title + '</h4></div>\n' +
              '<div class="modal-body"><div simple-form="addFormConfig" entity="addEntity" data="'
              + childDataModelName + '" schema="' + schemaName + '"></div></div>\n' +
              '<div class="modal-footer">' +
              '<button class="btn btn-primary add" type="button" ng-click="addAndCloseDialog()">Add</button>' +
              '<button class="btn btn-warning cancel" type="button" ng-click="closeAddDialog()">Cancel</button>' +
              '</div></div>');
            div.append(addDialog);
            this.$compile(addDialog)(scope);
          }
          scope.showAddDialog = true;
          Core.$apply(scope);
        };

        scope.closeAddDialog = () => {
          scope.showAddDialog = false;
          scope.addEntity = {};
        };

        scope.addAndCloseDialog = () => {
          var newData = scope.addEntity;
          log.info("About to add the new entity " + JSON.stringify(newData));
          if (newData) {
            updateData((data) => {
              // TODO deal with non arrays
              data.push(newData);
              return data;
            });
          }
          scope.closeAddDialog();
        };

        edit = this.getEditButton(config);

        scope.editDialogOptions = {
          backdropFade: true,
          dialogFade:true
        };
        scope.showEditDialog = false;

        scope.openEditDialog = () => {
          var selected = scope.selectedItems;
          // lets make a deep copy for the value being edited
          var editObject = {};
          if (selected && selected.length) {
            angular.copy(selected[0], editObject);
          }
          scope.editEntity = editObject;
          scope.editFormConfig = Forms.findArrayItemsSchema(property, schema);

          // lets lazily create the edit dialog
          if (!editDialog) {
            var title = "Edit " + tableName;
            editDialog = $('<div modal="showEditDialog" close="closeEditDialog()" options="editDialogOptions">\n' +
                    '<div class="modal-header"><h4>' + title + '</h4></div>\n' +
                    '<div class="modal-body"><div simple-form="editFormConfig" entity="editEntity"></div></div>\n' +
                    '<div class="modal-footer">' +
                    '<button class="btn btn-primary save" type="button" ng-click="editAndCloseDialog()">Save</button>' +
                    '<button class="btn btn-warning cancel" type="button" ng-click="closeEditDialog()">Cancel</button>' +
                    '</div></div>');
            div.append(editDialog);
            this.$compile(editDialog)(scope);
          }
          scope.showEditDialog = true;
          Core.$apply(scope);
        };

        scope.closeEditDialog = () => {
          scope.showEditDialog = false;
          scope.editEntity = {};
        };

        scope.editAndCloseDialog = () => {
          var newData = scope.editEntity;
          console.log("About to edit the new entity " + JSON.stringify(newData));
          if (newData) {
            updateData((data) => {
              data = removeSelected(data);
              // TODO deal with non arrays
              data.push(newData);
              return data;
            });
          }
          scope.closeEditDialog();
        };

        remove = this.getRemoveButton(config);
      }

      var findFunction = function (scope, func) {
        if (angular.isDefined(scope[func]) && angular.isFunction(scope[func])) {
          return scope;
        }
        if (angular.isDefined(scope.$parent) && scope.$parent !== null) {
          return findFunction(scope.$parent, func);
        } else {
          return null;
        }
      };

      function maybeGet(scope, func) {
        if (scope !== null) {
          return scope[func];
        }
        return null;
      }

      var onRemoveFunc = config.onremove.replace('(', '').replace(')', '');
      var onEditFunc = config.onedit.replace('(', '').replace(')', '');
      var onAddFunc = config.onadd.replace('(', '').replace(')', '');

      var onRemove = maybeGet(findFunction(scope, onRemoveFunc), onRemoveFunc);
      var onEdit = maybeGet(findFunction(scope, onEditFunc), onEditFunc);
      var onAdd = maybeGet(findFunction(scope, onAddFunc), onAddFunc);

      if (onRemove === null) {
        onRemove = function () {
          updateData((data) => {
            return removeSelected(data);
          });
        }
      }
      if (onEdit === null) {
        onEdit = function () {
          scope.openEditDialog();
        }
      }
      if (onAdd === null) {
        onAdd = function (form) {
          scope.openAddDialog();
        }
      }
      if (add) {
        add.click((event) => {
          onAdd();
          return false;
        });
        controlDiv.append(add);
      }
      if (edit) {
        edit.click((event) => {
          onEdit();
          return false;
        });
        controlDiv.append(edit);
      }
      if (remove) {
        remove.click((event) => {
          onRemove();
          return false;
        });
        controlDiv.append(remove);
      }

      $(div).append(group);
      $(div).append(table);
      $(element).append(div);

      // compile the template
      this.$compile(div)(scope);
    }

    private getAddButton(config) {
      return $('<button type="button" class="btn add"><i class="' + config.addicon + '"></i> ' + config.addtext + '</button>');
    }

    private getEditButton(config) {
      return $('<button type="button" class="btn edit" ng-disabled="!selectedItems.length"><i class="' + config.editicon + '"></i> ' + config.edittext + '</button>');
    }

    private getRemoveButton(config) {
      return $('<button type="remove" class="btn remove" ng-disabled="!selectedItems.length"><i class="' + config.removeicon + '"></i> ' + config.removetext + '</button>');
    }


    private createTable(config, tableConfig) {
      //var tableType = "hawtio-datatable";
      var tableType = "hawtio-simple-table";
      var table = $('<div class="' + config.tableclass + '" ' + tableType + '="' + tableConfig + '">');
      //table.find('fieldset').append(this.getLegend(config));
      return table;
    }


    private getLegend(config) {
      var description = Core.pathGet(config, "data.description");
      if (description) {
        return '<legend>' + config.data.description + '</legend>';
      }
      return '';
    }


    private getControlGroup(config, arg, id) {
      var rc = $('<div class="' + config.controlgroupclass + '"></div>');
      if (angular.isDefined(arg.description)) {
        rc.attr('title', arg.description);
      }
      return rc;
    }

    private getControlDiv(config) {
      return $('<div class="' + config.controlclass + '"></div>');
    }


    private getHelpSpan(config, arg, id) {
      var rc = $('<span class="help-block"></span>');
      if (angular.isDefined(arg.type) && config.showtypes !== 'false') {
        rc.append('Type: ' + arg.type);
      }
      return rc;
    }

  }
}
