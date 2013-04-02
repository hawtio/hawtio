module Forms {

  /**
   * If the type name refers to an alias in the schemas defintions then perform the lookup and return the real type name
   */
  export function resolveTypeNameAlias(type, schema) {
    if (type && schema) {
      var alias = lookupDefinition(type, schema);
      if (alias) {
        var realType = alias["type"];
        if (realType) {
          type = realType;
        }
      }
    }
    return type;
  }

  /**
   * Looks up the given type name in the schemas definitions
   */
  export function lookupDefinition(name, schema) {
    if (schema) {
      var defs = schema.definitions;
      if (defs) {
        return defs[name];
      }
    }
    return null;
  }

  /**
   * For an array property, find the schema of the items which is either nested inside this property
   * in the 'items' property; or the type name is used to lookup in the schemas definitions
   */
  export function findArrayItemsSchema(property, schema) {
    var items = null;
    if (property && schema) {
      items = property.items;
      if (items) {
        var typeName = items["type"];
        if (typeName) {
          var definition = lookupDefinition(typeName, schema);
          if (definition) {
            return definition;
          }
        }
      }
      // are we a json schema properties with a link to the schema doc?
      var additionalProperties = property.additionalProperties;
      if (additionalProperties) {
        if (additionalProperties["$ref"] === "#") {
          return schema;
        }
      }
    }
    return items;
  }

  /**
   * Returns true if the given property represents a nested object or array of objects
   */
  export function isArrayOrNestedObject(property, schema) {
    if (property) {
      var propType = resolveTypeNameAlias(property["type"], schema);
      if (propType) {
        if (propType === "object" || propType === "array") {
          return true;
        }
      }
    }
    return false;
  }

  export function configure(config, scopeConfig, attrs) {
    if (angular.isDefined(scopeConfig)) {
      config = angular.extend(config, scopeConfig);
    }
    return angular.extend(config, attrs);
  }

  export function getControlGroup(config, arg, id) {
    var rc = $('<div class="' + config.controlgroupclass + '"></div>');
    if (angular.isDefined(arg.description)) {
      rc.attr('title', arg.description);
    }
    return rc;
  }

  export function getLabel(config, arg, id) {
    return $('<label class="' + config.labelclass + '">' + humanizeValue(id.capitalize()) + ': </label>');
  }

  export function getControlDiv(config) {
    return $('<div class="' + config.controlclass + '"></div>');
  }

  export function getHelpSpan(config, arg, id) {
    var rc = $('<span class="help-block"></span>');
    if (angular.isDefined(arg.type) && config.showtypes !== 'false') {
      rc.append('Type: ' + arg.type);
    }
    return rc;
  }






}
