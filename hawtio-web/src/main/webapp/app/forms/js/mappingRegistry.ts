/**
 * @module Forms
 */
///<reference path="formHelpers.ts"/>
module Forms {

  /**
   * Create a DOM widget tree for the given set of form configuration data.
   *
   * This will include either the standard AngularJS widgets or custom widgets
   */
  export function createWidget(propTypeName, property, schema, config, id, ignorePrefixInLabel, configScopeName,
                               wrapInGroup = true, disableHumanizeLabel = false) {
    var input:JQuery = null;
    var group:JQuery = null;

    function copyElementAttributes(element, propertyName) {
      var propertyAttributes = property[propertyName];
      if (propertyAttributes) {
        angular.forEach(propertyAttributes, function (value, key) {
          if (angular.isString(value)) {
            element.attr(key, value);
          }
        });
      }

    }
    function copyAttributes() {
      copyElementAttributes(input, "input-attributes");
      angular.forEach(property, function (value, key) {
        if (angular.isString(value) && key.indexOf("$") < 0 && key !== "type") {
          var html = Core.escapeHtml(value);
          input.attr(key, html);
        }
      });
    }

    var options = {
      valueConverter: null
    };
    var safeId = Forms.safeIdentifier(id);

    // mark as required
    var required:boolean = property.required || false;

    var inputMarkup = createStandardWidgetMarkup(propTypeName, property, schema, config, options, safeId);

    if (inputMarkup) {
      input = angular.element(inputMarkup);

      copyAttributes();

      id = safeId;

      var modelName = config.model || Core.pathGet(property, ["input-attributes", "ng-model"]);
      if (!modelName) {
        modelName = config.getEntity() + "." + id;
      }
      input.attr("ng-model", modelName);

      input.attr('name', id);

      var title = property.title ||  property.tooltip || property.label;
      if (title) {
        input.attr('title', title);
      }
      var tooltip = property.tooltip || property.description;
      if (tooltip) {
        input.attr('tooltip', tooltip);
      }

      var disableHumanizeLabelValue = disableHumanizeLabel || property.disableHumanizeLabel;

      // allow the prefix to be trimmed from the label if enabled
      var defaultLabel = id;
      if (ignorePrefixInLabel || property.ignorePrefixInLabel) {
        var idx = id.lastIndexOf('.');
        if (idx > 0) {
          defaultLabel = id.substring(idx + 1);
        }
      }
      // figure out which things to not wrap in a group and label etc...
      if (input.attr("type") !== "hidden" && wrapInGroup) {
        group = this.getControlGroup(config, config, id);
        var labelText = property.title || property.label ||
          (disableHumanizeLabelValue ? defaultLabel : Core.humanizeValue(defaultLabel));
        var labelElement = Forms.getLabel(config, config, labelText, required);
        if (tooltip) {
          // favor using the tooltip as the title so we get the long description when people hover the mouse over the label
          labelElement.attr('title', tooltip);
        } else if (title) {
          labelElement.attr('title', title);
        }
        group.append(labelElement);
        copyElementAttributes(labelElement, "label-attributes");

        var controlDiv = Forms.getControlDiv(config);
        controlDiv.append(input);
        controlDiv.append(Forms.getHelpSpan(config, config, id, property));

        group.append(controlDiv);

        // add logic to be able to hide empty values
        var showEmpty = config.showempty;
        if (angular.isDefined(showEmpty)) {
          var attValue:string = "true";
          if (showEmpty === "true" || showEmpty === "false") {
            attValue = showEmpty;
          } else if (angular.isString(id)) {
            attValue = showEmpty + '(\'' + id + '\')'
          }
          group.attr("ng-show", attValue);
        }

        // allow control level directives, such as ng-show / ng-hide
        copyElementAttributes(controlDiv, "control-attributes");
        copyElementAttributes(group, "control-group-attributes");

        var scope = config.scope;
        if (scope && modelName) {
          var onModelChange = function(newValue) {
            scope.$emit("hawtio.form.modelChange", modelName, newValue);
          };
          var fn = onModelChange;
          // allow custom converters
          var converterFn:(scope, modelName) => void = options.valueConverter;
          if (converterFn) {
            fn = function() {
              converterFn(scope, modelName);
              var newValue = Core.pathGet(scope, modelName);
              onModelChange(newValue);
            }
          }
          scope.$watch(modelName, fn);
        }
      }
    } else {
      input = angular.element('<div></div>');
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
      if (disableHumanizeLabel || property.disableHumanizeLabel) {
        input.attr('disable-humanize-label', true);
      }
      input.attr('name', id);
    }

    var label = property.label;
    if (label) {
      input.attr('title', label);
    }

    // if in read-only mode, then configure the input accordingly
    try {
      if (config.isReadOnly()) {
          input.attr('readonly', 'true');
        // for checkbox in read-only mode, need to be disabled otherwise ppl can change the values in the selectbox
        if (input[0].localName === "select" || (input[0].localName === "input" && input.attr("type") === "checkbox")) {
          input.attr('disabled', 'true');
        }
      }
    } catch (e) {
      // ignore missing read only function
    }
    if (required) {
      // don't mark checkboxes as required
      if (input[0].localName === "select" || (input[0].localName === "input" && input.attr("type") === "checkbox")) {
        // lets not set required on a checkbox, it doesn't make any sense ;)
        input.removeAttr('required')
      } else {
        input.attr('required', 'true');
      }
    }
    return group ? group : input;
  }

  /**
   * Lets try create the standard angular JS widgets markup
   * @method createStandardWidgetMarkup
   * @param {String} propTypeName
   * @param {any} property
   * @param {any} schema
   * @param {any} config
   * @param {any} options
   * @param {String} id
   */
  export function createStandardWidgetMarkup(propTypeName, property, schema, config, options, id) {
    // lets try use standard widgets first...
    var type = Forms.resolveTypeNameAlias(propTypeName, schema);
    if (!type) {
      return '<input type="text"/>';
    }
    var custom = Core.pathGet(property, ["formTemplate"]);
    if (custom) {
      return null;
    }
    var inputElement = Core.pathGet(property, ["input-element"]);
    if (inputElement) {
      return "<" + inputElement + "></" + inputElement + ">";
    }
    var enumValues = Core.pathGet(property, ["enum"]);
    if (enumValues) {
      var required = true;
      var valuesScopeName = null;
      var attributes = "";
      if (enumValues) {
        // calculate from input attributes...
        var scope = config.scope;
        var data = config.data;
        if (data && scope) {
          // this is a big ugly - would be nice to expose this a bit easier...
          // maybe nested objects should expose the model easily...
          var fullSchema = scope[config.schemaName];
          var model = angular.isString(data) ? scope[data] : data;
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
          // if the bit ugly properites hunt didnt work, then use the enumValues as-is
          // as they are already the values we want
          if (angular.isUndefined(values)) {
            values = enumValues;
          }
          valuesScopeName = "$values_" + id.replace(/\./g, "_");
          scope[valuesScopeName] = values;
        }
      }
      if (valuesScopeName) {
        attributes += ' ng-options="value for value in ' + valuesScopeName + '"';
      }
      var defaultOption = required ? "" : '<option value=""></option>';
      return '<select' + attributes + '>' + defaultOption + '</select>';
    }

    if (angular.isArray(type)) {
      // TODO union of tabbed forms such as Marshal / Unmarshal in camel...
      return null;
    }
    if (!angular.isString(type)) {
      return null;
    }
    var defaultValueConverter:(scope:any, modelName:string) => void = null;
    var defaultValue = property.default || property.defaultValue;
    if (defaultValue) {
        // lets add a default value
        defaultValueConverter = (scope, modelName):void => {
          var value = Core.pathGet(scope, modelName);
          if (!value)  {
            Core.pathSet(scope, modelName, defaultValue);
          }
        };
        options.valueConverter = defaultValueConverter;
    }

    function getModelValueOrDefault(scope, modelName) {
      var value = Core.pathGet(scope, modelName);
      if (!value && typeof value != "boolean") {
        var defaultValue = property.default || property.defaultValue;
        if (defaultValue) {
          value = defaultValue;
          Core.pathSet(scope, modelName, value);
        }
      }
      return value;
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
          var value = getModelValueOrDefault(scope, modelName);
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
        // no standard markup for these types
        return null;

      case "boolean":
      case "bool":
      case "java.lang.boolean":
        // lets add a value conversion watcher...
        options.valueConverter = function (scope, modelName) {
          var value = getModelValueOrDefault(scope, modelName);
          if (value && ("true" === value || "false" === value))  {
            var newValue = "true" === value ? true : false;
            Core.pathSet(scope, modelName, newValue);
          }
        };
        return '<input type="checkbox"/>';

      case "password":
        return '<input type="password"/>';

      case "hidden":
        return '<input type="hidden"/>';

      case "map":
        return null;

      default:
        // lets check if this name is an alias to a definition in the schema
        return '<input type="text"/>';
    }
  }

  export function mapType(type:String):String {
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
        return "number";
      case "array":
      case "java.lang.array":
      case "java.lang.iterable":
      case "java.util.list":
      case "java.util.collection":
      case "java.util.iterator":
      case "java.util.set":
      case "object[]":
        return "text";
      case "boolean":
      case "bool":
      case "java.lang.boolean":
        return "checkbox";
      case "password":
        return "password";
      case "hidden":
        return "hidden";
      default:
        return "text";
    }
  }

  export function normalize(type, property:any, schema) {
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
        var items:any = property.items;
        if (items) {
          var typeName = items.type;
          if (typeName && typeName === "string") {
            return "hawtio-form-string-array";
          }
        } else {
          // let's use the string array if no type is set,
          // at least that provides a form of some kind
          return "hawtio-form-string-array";
        }
        log.debug("Returning hawtio-form-array for : ", property);
        return "hawtio-form-array";
      case "boolean":
      case "bool":
      case "java.lang.boolean":
        return "hawtio-form-checkbox";
      case "password":
        return "hawtio-form-password";
      case "hidden":
        return "hawtio-form-hidden";
      case "map":
        return "hawtio-form-map";
      default:
        // lets check if this name is an alias to a definition in the schema
        return "hawtio-form-text";
    }
  }
}
