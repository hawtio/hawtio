
/* We have to delegate some calls to real Angular.js */
var _angular = angular;

/* Mocking hawt.io loader */
var hawtioPluginLoader = {
  addModule: function(pluginName) {},
  parseQueryString: function() {
    return {};
  },
  addUrl: function(url) {},
  registerPreBootstrapTask: function() {},
  loadPlugins: function() {}
};

var _modules = [];
var _modulesMap = {};

var _factoriesMap = {};
var _servicesMap = {};
var _valuesMap = {};
var _constantsMap = {};

var _controllersMap = {};
var _directivesMap = {};
var _filtersMap = {};
var _providersMap = {};

// mapping of service/factory/controller/directive/filter to its defining module
var _definingModules = {};

function _validateProviderMethod(module, type, name, dependencies, map, collection) {
//  console.info(" - Creating " + type + " \"" + name + "\" in module \"" + module.moduleName + "\" with " + dependencies.length + " dependencies");
  if (_angular.isFunction(dependencies)) {
    // "dependencies" function should be no-arg
    if (dependencies.length > 0) {
      console.error("Wrong definition of " + type + " \"" + name + "\". Function signature should have no arguments.");
    }
    dependencies = [];
  }
  if (typeof name !== "string" || !angular.isArray(dependencies)) {
    console.error("Wrong definition of " + type + " \"" + name + "\"");
  }
  if (dependencies.length > 0) {
    for (var idx = 0; idx<dependencies.length-1; idx++) {
      if (typeof dependencies[idx] !== "string") {
        console.error("Wrong definition of " + type + " \"" + name + "\". Array element #" + idx + "should be of type string.");
      } else {
        // module depends on service/factory/controller/value/ which may add new indirect module->module dependency
        module.otherDependencies[dependencies[idx]] = dependencies[idx];
      }
    }
    if (!_angular.isFunction(dependencies[dependencies.length-1])) {
      console.error("Wrong definition of " + type + " \"" + name + "\". Last array element should be function.");
    } else {
      if (dependencies[dependencies.length-1].length != dependencies.length-1) {
        console.error("Wrong definition of " + type + " \"" + name + "\". Function should have " + (dependencies.length-1) + " parameters, but has " + (dependencies[dependencies.length-1].length));
      }
    }
  }
  if (map[name] !== undefined) {
    console.error(type + " \"" + name + "\" already exists!");
  }
  map[name] = module;
  _definingModules[name] = module;
  collection.push(name);
}

function _validateNonProviderMethod(module, type, dependencies) {
//  console.info(" - Adding " + type + " function in module \"" + module.moduleName + "\" with " + dependencies.length + " dependencies");
  if (_angular.isFunction(dependencies)) {
    // "dependencies" function should be no-arg
    if (dependencies.length > 0) {
      console.error("Wrong definition of " + type + ". Function signature should have no arguments.");
    }
    dependencies = [];
  }
  if (!angular.isArray(dependencies)) {
    console.error("Wrong definition of " + type);
  }
  if (dependencies.length > 0) {
    for (var idx = 0; idx<dependencies.length-1; idx++) {
      if (typeof dependencies[idx] !== "string") {
        console.error("Wrong definition of " + type + ". Array element #" + idx + "should be of type string.");
      }
    }
    if (!_angular.isFunction(dependencies[dependencies.length-1])) {
      console.error("Wrong definition of " + type + ". Last array element should be function.");
    } else {
      if (dependencies[dependencies.length-1].length != dependencies.length-1) {
        console.error("Wrong definition of " + type + ". Function should have " + (dependencies.length-1) + " parameters, but has " + (dependencies[dependencies.length-1].length));
      }
    }
  }
}

/* Mocking Angular.js module */
function Module(moduleName, dependencies) {
  if (typeof moduleName !== "string" || !angular.isArray(dependencies)) {
    console.error("Wrong definition of module \"" + moduleName + "\"");
  }

  this.moduleName = moduleName;
  this.dependencies = {}; // direct module dependencies to other modules
  this.otherDependencies = {}; // direct module dependencies to services/values/factories
  this.otherExternalDependencies = {}; // indirect module dependencies (from services/values/factories) to other services/values/factories (which modules aren't known)

  this.controllers = [];
  this.services = [];
  this.factories = [];
  this.directives = [];
  this.filters = [];
  this.valuesTab = [];
  this.constants = [];
  this.providers = [];

  if (dependencies.length > 0) {
    for (var idx = 0; idx<dependencies.length; idx++) {
      if (typeof dependencies[idx] !== "string") {
        console.error("Wrong definition of module \"" + moduleName + "\". Array element #" + idx + "should be of type string.");
      } else {
        this.dependencies[dependencies[idx]] = dependencies[idx];
      }
    }
  }
  if (_modulesMap[moduleName] !== undefined) {
    console.error("Module \"" + moduleName + "\" already exists!");
  }

  console.info("Module \"" + moduleName + "\" <- " + _angular.toJson(dependencies));

  _modules.push(this);
  _modulesMap[this.moduleName] = this;
}

Module.prototype.value = function(valueName, value) {
//  console.info(" - Creating value \"" + valueName + "\" in module \"" + this.moduleName + "\"");
  if (typeof valueName !== "string") {
    console.error("Wrong definition of value \"" + valueName + "\"");
  }
  if (_valuesMap[valueName] !== undefined) {
    console.error("Value \"" + valueName + "\" already exist!");
  }
  _valuesMap[valueName] = valueName;
  this.valuesTab.push(valueName);
  return this;
};
Module.prototype.constant = function(constantName, value) {
//  console.info(" - Creating constant \"" + constantName + "\" in module \"" + this.moduleName + "\"");
  if (typeof constantName !== "string") {
    console.error("Wrong definition of constant \"" + constantName + "\"");
  }
  if (_constantsMap[constantName] !== undefined) {
    console.error("Constant \"" + constantName + "\" already exist!");
  }
  _constantsMap[constantName] = constantName;
  this.constants.push(constantName);
  return this;
};

Module.prototype.factory = function(factoryName, dependencies) {
  _validateProviderMethod(this, "factory", factoryName, dependencies, _factoriesMap, this.factories);
  return this;
};
Module.prototype.service = function(serviceName, dependencies) {
  _validateProviderMethod(this, "service", serviceName, dependencies, _servicesMap, this.services);
  return this;
};

Module.prototype.controller = function(controllerName, dependencies) {
  _validateProviderMethod(this, "controller", controllerName, dependencies, _controllersMap, this.controllers);
  return this;
};
Module.prototype.directive = function(directiveName, dependencies) {
  _validateProviderMethod(this, "directive", directiveName, dependencies, _directivesMap, this.directives);
  return this;
};
Module.prototype.filter = function(filterName, dependencies) {
  _validateProviderMethod(this, "filter", filterName, dependencies, _filtersMap, this.filters);
  return this;
};
Module.prototype.provider = function(providerName, dependencies) {
  _validateProviderMethod(this, "provider", providerName, dependencies, _providersMap, this.providers);
  return this;
};

Module.prototype.run = function(dependencies) {
  _validateNonProviderMethod(this, "run()", dependencies);
};
Module.prototype.config = function(dependencies) {
  _validateNonProviderMethod(this, "config()", dependencies);
};

/* Mocking&delegating Angular.js static methods */
var angular = {
  module: function(moduleName, dependencies) {
    if (dependencies === undefined) {
      return _modulesMap[moduleName];
    } else {
      return new Module(moduleName, dependencies);
    }
  },
  isArray: function(v) {
    return _angular.isArray(v);
  },
  isString: function(v) {
    return _angular.isString(v);
  },
  forEach: function(obj, iterator, context) {
    return _angular.forEach(obj, iterator, context);
  }
};
