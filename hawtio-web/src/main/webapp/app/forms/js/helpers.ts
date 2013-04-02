module Forms {

  /**
   * If the type name refers to an alias in the schemas defintions then perform the lookup and return the real type name
   */
  export function resolveTypeNameAlias(type, schema) {
    if (type && schema) {
      var defs = schema.definitions;
      if (defs) {
        var alias = defs[type];
        if (alias) {
          var realType = alias["type"];
          if (realType) {
            type = realType;
          }
        }
      }
    }
    return type;
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

  /*
   export function sanitize(arg) {
   if (angular.isDefined(arg.formType)) {
   // user-defined input type
   return arg;
   }
   arg.formType = Forms.normalize(arg.type);
   return arg;
   }
   */

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
