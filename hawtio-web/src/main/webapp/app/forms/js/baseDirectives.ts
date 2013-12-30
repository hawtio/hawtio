/**
 * @module Forms
 */
module Forms {

    /**
     * @class InputBaseConfig
      */
  export class InputBaseConfig {
    public name = 'input';
    public type = '';
    public description = '';
    public _default = '';
    public scope = null;

    // Can also be 'view'
    public mode = 'edit';

    // the name of the full schema
    public schemaName = "schema";

    public controlgroupclass = 'control-group';
    public controlclass = 'controls';
    public labelclass = 'control-label';
    public showtypes = 'false';


    /**
     * Custom template for custom form controls
     * @property
     * @type String
     */
    public formtemplate = null;

    /**
     * the name of the attribute in the scope which is the data to be edited
     * @property
     * @type String
     */
    public entity = 'entity';

    /**
     * the model expression to bind to. If omitted this defaults to entity + "." + name
     * @property
     * @type String
     */
    public model = undefined;

    public getEntity() {
      return this.entity || "entity";
    }

    public getMode() {
      return this.mode || "edit";
    }

    public isReadOnly() {
      return this.getMode() === "view";
    }

  }


  export class InputBase {

    public restrict = 'A';
    public scope = true;
    public replace = false;
    public transclude = false;

    private attributeName = '';

    public link: (scope, element, attrs) => any;

    constructor(public workspace, public $compile) {
      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }

    }

    public doLink(scope, element, attrs) {
      var config = new InputBaseConfig
      config = configure(config, null, attrs);
      config.scope = scope;
      config.schemaName = attrs["schema"] || "schema";

      var id = Forms.safeIdentifier(config.name);
      var group = this.getControlGroup(config, config, id);

      var modelName = config.model;
      if (!angular.isDefined(modelName)) {
        // TODO always use 2 way binding?
        modelName = config.getEntity() + "." + id;
      }

      // allow the prefix to be trimmed from the label
      var defaultLabel = id;
      if ("true" === attrs["ignorePrefixInLabel"]) {
        var idx = id.lastIndexOf('.');
        if (idx > 0) {
          defaultLabel = id.substring(idx + 1);
        }
      }
      group.append(Forms.getLabel(config, config, attrs["title"] || humanizeValue(defaultLabel)));
      var controlDiv = Forms.getControlDiv(config);
      controlDiv.append(this.getInput(config, config, id, modelName));
      controlDiv.append(Forms.getHelpSpan(config, config, id));
      group.append(controlDiv);
      $(element).append(this.$compile(group)(scope));

      if (scope && modelName) {
        scope.$watch(modelName, onModelChange);
      }
      function onModelChange(newValue) {
        scope.$emit("hawtio.form.modelChange", modelName, newValue);
      }
    }

    public getControlGroup(config1, config2, id):any {
      return Forms.getControlGroup(config1, config2, id);      
    }

    public getInput(config, arg, id, modelName) {
      var rc = $('<span class="form-data"></span>');
      if (modelName) {
        rc.attr('ng-model', modelName);
        rc.append('{{' + modelName + '}}')
      }
      return rc;
    }
  }


  export class TextInput extends InputBase {

    public type = "text";

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    /*public getControlGroup(config1, config2, id) {
      return super.getControlGroup(config1, config2, id);
    }*/

    public getInput(config, arg, id, modelName) {
      if (config.isReadOnly()) {
        return super.getInput(config, arg, id, modelName);
      }
      var rc = $('<input type="' + this.type + '">');
      rc.attr('name', id);
      if (modelName) {
        rc.attr('ng-model', modelName);
      }
      if (config.isReadOnly()) {
        rc.attr('readonly', 'true');
      }
      var required = config.$attr["required"];
      if (required && required !== "false") {
        rc.attr('required', 'true');
      }
      return rc;
    }
  }


  export class HiddenText extends TextInput {

    public type = "hidden";

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public getControlGroup(config1, config2, id) {
      var group = super.getControlGroup(config1, config2, id);
      group.css({'display': 'none'});
      return group;
    }

    public getInput(config, arg, id, modelName) {
      var rc = super.getInput(config, arg, id, modelName);
      rc.attr('readonly', 'true');
      return rc;
    }

  }


  export class PasswordInput extends TextInput {
    
    public type = "password";

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

  }


  export class CustomInput extends InputBase {

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id, modelName) {
      var template = arg.formtemplate;
      template = Core.unescapeHtml(template);
      var rc = $(template);
      if (!rc.attr("name")) {
        rc.attr('name', id);
      }
      if (modelName) {
        rc.attr('ng-model', modelName);
      }
      if (config.isReadOnly()) {
        rc.attr('readonly', 'true');
      }
      return rc;
    }
  }

  export class SelectInput extends InputBase {

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id, modelName) {
      if (config.isReadOnly()) {
        return super.getInput(config, arg, id, modelName);
      }
      // TODO calculate from input attributes...
      var required = true;

      // TODO we could configure the null option...
      var defaultOption = required ? "" : '<option value=""></option>';
      var rc = $('<select>' + defaultOption + '</select>');
      rc.attr('name', id);

      var scope = config.scope;
      var data = config.data;
      if (data && scope) {
        // this is a big ugly - would be nice to expose this a bit easier...
        // maybe nested objects should expose the model easily...
        var fullSchema = scope[config.schemaName];
        var model = scope[data];
        // now we need to keep walking the model to find the enum values
        var paths = id.split(".");
        var property = null;
        angular.forEach(paths, (path) => {
          property = Core.pathGet(model, ["properties", path]);
          var typeName = Core.pathGet(property, ["type"]);
          var alias = Forms.lookupDefinition(typeName, fullSchema);
          if (alias) {
            model = alias;
          }
        });
        var values = Core.pathGet(property, ["enum"]);
        scope["$selectValues"] = values;
        rc.attr("ng-options", "value for value in $selectValues");
      }
      if (modelName) {
        rc.attr('ng-model', modelName);
      }
      if (config.isReadOnly()) {
        rc.attr('readonly', 'true');
      }
      return rc;
    }

  }


  export class NumberInput extends InputBase {

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id, modelName) {
      if (config.isReadOnly()) {
        return super.getInput(config, arg, id, modelName);
      }
      var rc = $('<input type="number">');
      rc.attr('name', id);

      if (angular.isDefined(arg.def)) {
        rc.attr('value', arg.def);
      }

      if (angular.isDefined(arg.minimum)) {
        rc.attr('min', arg.minimum);
      }

      if (angular.isDefined(arg.maximum)) {
        rc.attr('max', arg.maximum);
      }

      if (modelName) {
        rc.attr('ng-model', modelName);
      }
      if (config.isReadOnly()) {
        rc.attr('readonly', 'true');
      }

      // lets coerce any string values to numbers so that they work properly with the UI
      var scope = config.scope;
      if (scope) {
        function onModelChange() {
          var value = Core.pathGet(scope, modelName);
          if (value && angular.isString(value))  {
            var numberValue = Number(value);
            Core.pathSet(scope, modelName, numberValue);
          }
        }
        scope.$watch(modelName, onModelChange);
        onModelChange();
      }
      return rc;
    }
  }


  /**
   * Generates a list of strings which can be added / edited / removed
   * @class StringArrayInput
   */
  export class StringArrayInput extends InputBase {

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id, modelName) {
      var rowScopeName = "_" + id;
      var ngRepeat = rowScopeName + ' in ' + modelName;

      var readOnlyWidget = '{{' + rowScopeName + '}}';
      if (config.isReadOnly()) {
        return $('<ul><li ng-repeat="' + rowScopeName + ' in ' + modelName + '">' +
                readOnlyWidget +
                '</li></ul>');
      } else {
        // TODO there should be an easier way to find the property / schema!
        var scope = config.scope;
        var schema = scope[config.schemaName] || {};
        var properties = schema.properties || {};
        var arrayProperty = properties[id] || {};

        // lets refer to the property of the item, rather than the array
        var property = arrayProperty["items"] || {};
        var propTypeName = property.type;
        var ignorePrefixInLabel = true;
        var configScopeName = null;

        // lets create an empty array if its not yet set
        var value = Core.pathGet(scope, modelName);
        if (!value)  {
          Core.pathSet(scope, modelName, []);
        }

        var methodPrefix = "_form_stringArray" + rowScopeName + "_";
        var itemKeys = methodPrefix + "keys";
        var addMethod = methodPrefix + "add";
        var removeMethod = methodPrefix + "remove";

        // we maintain a separate object of all the keys (indices) of the array
        // and use that to lookup the values
        function updateKeys() {
          var value = Core.pathGet(scope, modelName) || [];
          scope[itemKeys] = Object.keys(value);
        }

        updateKeys();

        scope[addMethod] = () => {
          var value = Core.pathGet(scope, modelName) || [];
          value.push("");
          Core.pathSet(scope, modelName, value);
          updateKeys();
        };
        scope[removeMethod] = (idx) => {
          var value = Core.pathGet(scope, modelName) || [];
          if (idx < value.length) {
            value.splice(idx, 1);
          }
          Core.pathSet(scope, modelName, value);
          updateKeys();
        };

        // the expression for an item value
        var itemId = modelName + "[" + rowScopeName + "]";
        var itemsConfig = {
          model: itemId
        };
        var widget = Forms.createWidget(propTypeName, property, schema, itemsConfig, itemId, ignorePrefixInLabel, configScopeName, false);
        if (!widget) {
          widget = $(readOnlyWidget);
        }
        var markup = $('<div style="white-space: nowrap" ng-repeat="' + rowScopeName + ' in ' + itemKeys + '"></div>');
        markup.append(widget);
        markup.append($('<a ng-click="' + removeMethod + '(' + rowScopeName + ')" title="Remove this value"><i class="red icon-remove"></i></a>'));
        markup.after($('<a ng-click="' + addMethod + '()" title="Add a new value"><i class="icon-plus"></i></a>'));
        return markup;
      }

    }
  }

  export class ArrayInput extends InputBase {

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public doLink(scope, element, attrs) {

      var config = new InputBaseConfig
      config = Forms.configure(config, null, attrs);

      var id = config.name;
      var dataName = attrs["data"] || "";
      var entityName = attrs["entity"] || config.entity;
      var schemaName = attrs["schema"] || config.schemaName;

      function renderRow(cell, type, data) {
        if (data) {
          var description = data["description"];
          if (!description) {
            angular.forEach(data, (value, key) => {
              if (value && !description) {
                description = value;
              }
            })
          }
          return description;
        }
        return null;
      }

      // Had to fudge some of this

      // create a table UI!
      var tableConfigPaths = ["properties", id, "inputTable"];
      //var scope = config.scope;
      var tableConfig = null; Core.pathGet(scope, tableConfigPaths);
      // lets auto-create a default configuration if there is none
      if (!tableConfig) {
        // TODO ideally we should merge this config with whatever folks have hand-defined
        var tableConfigScopeName = tableConfigPaths.join(".");
        //var cellDescription = a["description"] || humanizeValue(id);
        var cellDescription = humanizeValue(id);
        tableConfig = {
          formConfig: config,
          title: cellDescription,

          data: config.entity + "." + id,
          displayFooter: false,
          showFilter: false,
          columnDefs: [
            {
              field: '_id',
              displayName: cellDescription,
              render: renderRow
            }
          ]
        };
        Core.pathSet(scope, tableConfigPaths, tableConfig);
      }
      var table = $('<div hawtio-input-table="' + tableConfigScopeName + '" data="' + dataName
        + '" property="' + id + '" entity="' + entityName
        + '" schema="' + schemaName + '"></div>');
      if (config.isReadOnly()) {
        table.attr("readonly", "true");
      }
      $(element).append(this.$compile(table)(scope));

    }
  }



  export class BooleanInput extends InputBase {

    constructor(public workspace, public $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id, modelName) {

      var rc = $('<input class="hawtio-checkbox" type="checkbox">');
      rc.attr('name', id);

      if (config.isReadOnly()) {
        rc.attr('disabled', 'true');
      }
      if (modelName) {
        rc.attr('ng-model', modelName);
      }
      if (config.isReadOnly()) {
        rc.attr('readonly', 'true');
      }

      // lets coerce any string values to boolean so that they work properly with the UI
      var scope = config.scope;
      if (scope) {
        function onModelChange() {
          var value = Core.pathGet(scope, modelName);
          if (value && "true" === value)  {
            //console.log("coercing String to boolean for " + modelName);
            Core.pathSet(scope, modelName, true);
          }
        }
        scope.$watch(modelName, onModelChange);
        onModelChange();
      }
      return rc;
    }

  }

}
