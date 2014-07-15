
/* We have to delegate some calls to real Angular.js */
var _angular = angular.noConflict();

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

function _validateProviderMethod(module, type, name, dependencies, map) {
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
  map[name] = name;
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
  console.info("Creating module \"" + moduleName + "\" with " + dependencies.length + " dependencies");
  if (typeof moduleName !== "string" || !angular.isArray(dependencies)) {
    console.error("Wrong definition of module \"" + moduleName + "\"");
  }
  this.moduleName = moduleName;
  this.dependencies = dependencies;
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
};

Module.prototype.factory = function(factoryName, dependencies) {
  _validateProviderMethod(this, "factory", factoryName, dependencies, _factoriesMap);
};
Module.prototype.service = function(serviceName, dependencies) {
  _validateProviderMethod(this, "service", serviceName, dependencies, _servicesMap);
};

Module.prototype.controller = function(controllerName, dependencies) {
  _validateProviderMethod(this, "controller", controllerName, dependencies, _controllersMap);
};
Module.prototype.directive = function(directiveName, dependencies) {
  _validateProviderMethod(this, "directive", directiveName, dependencies, _directivesMap);
};
Module.prototype.filter = function(filterName, dependencies) {
  _validateProviderMethod(this, "filter", filterName, dependencies, _filtersMap);
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
    return new Module(moduleName, dependencies);
  },
  isArray: function(v) {
    return _angular.isArray(v);
  },
  forEach: function(obj, iterator, context) {
    return _angular.forEach(obj, iterator, context);
  }
};
