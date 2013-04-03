module Forms {


  export class InputBaseConfig {
    public name = 'input';
    public type = '';
    public description = '';
    public _default = '';

    // Can also be 'view'
    public mode = 'edit';

    public controlgroupclass = 'control-group';
    public controlclass = 'controls';
    public labelclass = 'control-label';
    public showtypes = 'false';

    // the name of the attribute in the scope which is the data to be editted
    public entity = 'entity';


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

    constructor(private workspace, public $compile) {
      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }

    }

    private doLink(scope, element, attrs) {
      var config = new InputBaseConfig
      config = configure(config, null, attrs);

      var group = Forms.getControlGroup(config, config, config.name);
      group.append(Forms.getLabel(config, config, config.name));
      var controlDiv = Forms.getControlDiv(config);
      controlDiv.append(this.getInput(config, config, config.name));
      controlDiv.append(Forms.getHelpSpan(config, config, config.name));
      group.append(controlDiv);
      $(element).append(this.$compile(group)(scope));

    }

    public getInput(config, arg, id) {
      var rc = $('<span class="form-data"></span>');
      var modelName = arg.model;
      if (!angular.isDefined(arg.model)) {
        // TODO always use 2 way binding?
        modelName = config.getEntity() + "." + id;
      }
      if (modelName) {
        rc.attr('ng-model', modelName);
        rc.append('{{' + modelName + '}}')
      }

      return rc;
    }
  }


  export class TextInput extends InputBase {

    public type = "text";

    constructor(private workspace, private $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id) {
      if (config.isReadOnly()) {
        return super.getInput(config, arg, id);
      }
      var rc = $('<input type="' + this.type + '">');
      rc.attr('name', id);

      var modelName = arg.model;
      if (!angular.isDefined(arg.model)) {
        // TODO always use 2 way binding?
        modelName = config.getEntity() + "." + id;
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

    constructor(private workspace, private $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id) {
      if (config.isReadOnly()) {
        return super.getInput(config, arg, id);
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

      var modelName = arg.model;
      if (!angular.isDefined(arg.model)) {
        // TODO always use 2 way binding?
        modelName = config.getEntity() + "." + id;
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


  export class ObjectInput extends InputBase {

    constructor(private workspace, private $compile) {
      super(workspace, $compile);
    }

    public doLink(scope, element, attrs) {

      var config = new InputBaseConfig
      config = Forms.configure(config, null, attrs);

      var id = config.name;
      var dataName = attrs["data"] || "";
      var entityName = attrs["entity"] || config.entity;

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
              + '" property="' + id + '" entity="' + entityName + '"></div>');
      if (config.isReadOnly()) {
        table.attr("readonly", "true");
      }
      $(element).append(this.$compile(table)(scope));

    }

  }



  export class BooleanInput extends InputBase {

    constructor(private workspace, private $compile) {
      super(workspace, $compile);
    }

    public getInput(config, arg, id) {

      var rc = $('<input class="hawtio-checkbox" type="checkbox">');
      rc.attr('name', id);

      if (config.isReadOnly()) {
        rc.attr('disabled', 'true');
      }

      var modelName = arg.model;
      if (!angular.isDefined(arg.model)) {
        // TODO always use 2 way binding?
        modelName = config.getEntity() + "." + id;
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




}
