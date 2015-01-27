/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../baseIncludes.ts"/>
/**
 * @module Forms
 */
module Forms {

  export var log:Logging.Logger = Logger.get("Forms");

  /**
   * Default any values in the schema on the entity if they are not already present
   * @method defaultValues
   * @param {any} entity
   * @param {any} schema
   */
  export function defaultValues(entity, schema) {
    if (entity && schema) {
      angular.forEach(schema.properties, (property, key) => {
        var defaultValue = property.default;
        if (defaultValue && !entity[key]) {
          console.log("===== defaulting value "  + defaultValue + " into entity[" + key + "]");
          entity[key] = defaultValue;
        }
      })
    }
  }

  /**
   * If the type name refers to an alias in the schemas definitions then perform the lookup and return the real type name
   * @method resolveTypeNAmeAlias
   * @param {String} type
   * @param {any} schema
   *
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
   * Walks the base class hierarchy checking if the given type is an instance of the given type name
   * @method isJsonType
   * @param {String} name
   * @param {any} schema
   * @param {String} typeName
   * @return {Boolean}
   */
  export function isJsonType(name, schema, typeName) {
    var definition = lookupDefinition(name, schema);
    while (definition) {
      var extendsTypes = Core.pathGet(definition, ["extends", "type"]);
      if (extendsTypes) {
        if (typeName === extendsTypes) {
          return true;
        } else {
          definition = lookupDefinition(extendsTypes, schema);
        }
      } else {
        return false;
      }
    }
    return false;
  }

  /**
   * Removes any dodgy characters for a valid identifier in angularjs such as for '-' characters
   * which are replaced with '_'
   * @method safeIdentifier
   * @param {String} id
   * @return {String}
   */
  export function safeIdentifier(id: string) {
    if (id) {
      return id.replace(/-/g, "_");
    }
    return id;
  }

  /**
   * Looks up the given type name in the schemas definitions
   * @method lookupDefinition
   * @param {String} name
   * @param {any} schema
   */
  export function lookupDefinition(name, schema) {
    if (schema) {
      var defs = schema.definitions;
      if (defs) {
        var answer = defs[name];
        if (answer) {
          var fullSchema = answer["fullSchema"];
          if (fullSchema) {
            return fullSchema;
          }
          // we may extend another, if so we need to copy in the base properties
          var extendsTypes = Core.pathGet(answer, ["extends", "type"]);
          if (extendsTypes) {
            fullSchema = angular.copy(answer);
            fullSchema.properties = fullSchema.properties || {};
            if (!angular.isArray(extendsTypes)) {
              extendsTypes = [extendsTypes];
            }
            angular.forEach(extendsTypes, (extendType) => {
              if (angular.isString(extendType)) {
                var extendDef = lookupDefinition(extendType, schema);
                var properties = Core.pathGet(extendDef, ["properties"]);
                if (properties) {
                  angular.forEach(properties, (property, key) => {
                    fullSchema.properties[key] = property;
                  });
                }
              }
            });
            answer["fullSchema"] = fullSchema;
            return fullSchema;
          }
        }
        return answer;
      }
    }
    return null;
  }

  /**
   * For an array property, find the schema of the items which is either nested inside this property
   * in the 'items' property; or the type name is used to lookup in the schemas definitions
   * @method findArrayItemsSchema
   * @param {String} property
   * @param {any} schema
   */
  export function findArrayItemsSchema(property, schema):any {
    var items:any = null;
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
   * Returns true if the given schema definition is an object
   * @method isObjectType
   * @param {any} definition
   */
  export function isObjectType(definition) {
    var typeName = Core.pathGet(definition, "type");
    return typeName && "object" === typeName;
  }

  /**
   * Returns true if the given schema definition property kind matches the given kind
   * @method isKind
   * @param {any} definition
   * @param {string} kind
   */
  export function isKind(definition, kind:string) {
    var kindName = Core.pathGet(definition, "kind");
    return kindName && kind === kindName;
  }

  /**
   * Returns true if the given property represents a nested object or array of objects
   * @method isArrayOrNestedObject
   * @param {any} property
   * @param {any} schema
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
    var rc = angular.element('<div class="' + config.controlgroupclass + '"></div>');
    if (angular.isDefined(arg.description)) {
      rc.attr('title', arg.description);
    }

    // log.debug("getControlGroup, config:", config, " arg: ", arg, " id: ", id);
    if (config['properties'] && config['properties'][id]) {
      var elementConfig = config['properties'][id];
      // log.debug("elementConfig: ", elementConfig);
      if (elementConfig && 'control-attributes' in elementConfig) {
        angular.forEach(elementConfig['control-attributes'], (value, key) => {
          rc.attr(key, value);
        });
      }
    }

    return rc;
  }

  export function getLabel(config, arg, label) {
    return angular.element('<label class="' + config.labelclass + '">' + label + ': </label>');
  }

  export function getControlDiv(config) {
    return angular.element('<div class="' + config.controlclass + '"></div>');
  }

  export function getHelpSpan(config, arg, id) {
    var help = Core.pathGet(config.data, ['properties', id, 'help']);
    if (Core.isBlank(help)) {
      // fallback and use description
      help = Core.pathGet(config.data, ['properties', id, 'description']);
    }

    var show = config.showhelp || "true";

    if (!Core.isBlank(help)) {
      return angular.element('<span class="help-block" ng-show="' + show + '">' + help + '</span>');
    } else {
      return angular.element('<span class="help-block"></span>');
    }
  }
}
