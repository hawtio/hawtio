module Forms {

  /**
   * Create a DOM widget tree for the given set of form configuration data.
   *
   * This will include either the standard AngularJS widgets or custom widgets
   */
  export function createWidget(propTypeName, property, schema, config, id, ignorePrefixInLabel, configScopeName) {
    var input = null;
    var group = null;

    function copyAttributes() {
      angular.forEach(property, function (value, key) {
        if (angular.isString(value) && key.indexOf("$") < 0 && key !== "type") {
          var html = Core.escapeHtml(value);
          input.attr(key, html);
        }
      });
    }

    // lets try to create standard widget markup by default
    // as they work better than the hawtio wrappers when inside forms...
    var options = {
      valueConverter: null
    };
    var inputMarkup = createStandardWidgetMarkup(propTypeName, property, schema, config, options);

    // Note if for whatever reason we need to go back to the old way of using hawtio directives for standard
    // angularjs directives, just clear inputMarker to null here ;)
    if (inputMarkup) {
      input = $(inputMarkup);

      copyAttributes();

      var id = Forms.safeIdentifier(id);

      var modelName = config.model;
      if (!modelName) {
        modelName = config.getEntity() + "." + id;
      }
      input.attr("ng-model", modelName);

      input.attr('name', id);

      var title = property.tooltip || property.label;
      if (title) {
        input.attr('title', title);
      }

      // allow the prefix to be trimmed from the label if enabled
      var defaultLabel = id;
      if (ignorePrefixInLabel || property.ignorePrefixInLabel) {
        var idx = id.lastIndexOf('.');
        if (idx > 0) {
          defaultLabel = id.substring(idx + 1);
        }
      }
      // figure out which things to not wrap in a group and label etc...
      if (input.attr("type") !== "hidden") {
        group = this.getControlGroup(config, config, id);
        group.append(Forms.getLabel(config, config, property.label || humanizeValue(defaultLabel)));
        var controlDiv = Forms.getControlDiv(config);
        controlDiv.append(input);
        controlDiv.append(Forms.getHelpSpan(config, config, id));
        group.append(controlDiv);

        var scope = config.scope;
        if (scope && modelName) {
          var fn = onModelChange;
          // allow custom converters
          var converterFn = options.valueConverter;
          if (converterFn) {
            fn = function() {
              converterFn(scope, modelName);
              var newValue = Core.pathGet(scope, modelName);
              onModelChange(newValue);
            }
          }
          scope.$watch(modelName, fn);
        }

        function onModelChange(newValue) {
          scope.$emit("hawtio.form.modelChange", modelName, newValue);
        }
      }
    } else {
      input = $('<div></div>');
      input.attr(Forms.normalize(propTypeName, property, schema), '');

      copyAttributes();

      input.attr('entity', config.getEntity());
      input.attr('mode', config.getMode());

      var fullSchemaName = config.schemaName;
      if (fullSchemaName) {
        input.attr('schema', fullSchemaName);
      }

      if (configScopeName) {
        input.attr('data', configScopeName);
      }

      if (ignorePrefixInLabel || property.ignorePrefixInLabel) {
        input.attr('ignore-prefix-in-label', true);
      }
      input.attr('name', id);
    }

    var label = property.label;
    if (label) {
      input.attr('title', label);
    }


    // TODO check for id in the schema["required"] array too!
    // as required can be specified either via either of these approaches
/*
    var schema = {
      required: ["foo", "bar"],
      properties: {
        something: {
          required: true,
          type: "string"
        }
      }
    }
*/
    if (property.required) {
      // don't mark checkboxes as required
      if (input[0].localName === "input" && input.attr("type") === "checkbox") {
        // lets not set required on a checkbox, it doesn't make any sense ;)
      } else {
        input.attr('required', 'true');
      }
    }
    return group ? group : input;
  }

  /**
   * Lets try create the standard angular JS widgets markup
   */
  export function createStandardWidgetMarkup(propTypeName, property, schema, config, options) {
    // lets try use standard widgets first...
    var type = Forms.resolveTypeNameAlias(propTypeName, schema);
    if (!type) {
      return '<input type="text"/>';
    }
    var custom = Core.pathGet(property, ["formTemplate"]);
    if (custom) {
      return null;
    }
    var enumValues = Core.pathGet(property, ["enum"]);
    if (enumValues) {
      // TODO use select?
      return null;
    }

    if (angular.isArray(type)) {
      // TODO union of tabbed forms such as Marshal / Unmarshal in camel...
      return null;
    }
    if (!angular.isString(type)) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "int":
      case "integer":
      case "long":
      case "short":
      case "java.lang.integer":
      case "java.lang.long":
      case "float":
      case "double":
      case "java.lang.float":
      case "java.lang.double":
        // lets add a value conversion watcher...
        options.valueConverter = function (scope, modelName) {
          var value = Core.pathGet(scope, modelName);
          if (value && angular.isString(value))  {
            var numberValue = Number(value);
            Core.pathSet(scope, modelName, numberValue);
          }
        };
        return '<input type="number"/>';

      // collections or arrays
      case "array":
      case "java.lang.array":
      case "java.lang.iterable":
      case "java.util.list":
      case "java.util.collection":
      case "java.util.iterator":
      case "java.util.set":
      case "object[]":

        // TODO hack for now - objects should not really use the table, thats only really for arrays...
        /*
         case "object":
         case "java.lang.object":
         */
        //return "hawtio-form-array";
        return null;

      case "boolean":
      case "bool":
      case "java.lang.boolean":
        // lets add a value conversion watcher...
        options.valueConverter = function (scope, modelName) {
          var value = Core.pathGet(scope, modelName);
          if (value && "true" === value)  {
            //console.log("coercing String to boolean for " + modelName);
            Core.pathSet(scope, modelName, true);
          }
        };
        return '<input type="checkbox"/>';

      case "password":
        return '<input type="password"/>';

      case "hidden":
        return '<input type="hidden"/>';
      default:
        // lets check if this name is an alias to a definition in the schema
        return '<input type="text"/>';
    }
  }

  export function normalize(type, property, schema) {
    type = Forms.resolveTypeNameAlias(type, schema);
    if (!type) {
      return "hawtio-form-text";
    }
    var custom = Core.pathGet(property, ["formTemplate"]);
    if (custom) {
      return "hawtio-form-custom";
    }
    var enumValues = Core.pathGet(property, ["enum"]);
    if (enumValues) {
      // TODO could use different kinds of radio / combo box
      return "hawtio-form-select";
    }

    if (angular.isArray(type)) {
      // TODO union of tabbed forms such as Marshal / Unmarshal in camel...
      return null;
    }
    if (!angular.isString(type)) {
      try {
        console.log("Unsupported JSON schema type value " + JSON.stringify(type));
      } catch (e) {
        console.log("Unsupported JSON schema type value " + type);
      }
      return null;
    }
    switch (type.toLowerCase()) {
      case "int":
      case "integer":
      case "long":
      case "short":
      case "java.lang.integer":
      case "java.lang.long":
      case "float":
      case "double":
      case "java.lang.float":
      case "java.lang.double":
        return "hawtio-form-number";

      // collections or arrays
      case "array":
      case "java.lang.array":
      case "java.lang.iterable":
      case "java.util.list":
      case "java.util.collection":
      case "java.util.iterator":
      case "java.util.set":
      case "object[]":

        // TODO hack for now - objects should not really use the table, thats only really for arrays...
        /*
         case "object":
         case "java.lang.object":
         */
        return "hawtio-form-array";
      case "boolean":
      case "bool":
      case "java.lang.boolean":
        return "hawtio-form-checkbox";
      case "password":
        return "hawtio-form-password";
      case "hidden":
        return "hawtio-form-hidden";
      default:
        // lets check if this name is an alias to a definition in the schema
        return "hawtio-form-text";
    }
  }
}
