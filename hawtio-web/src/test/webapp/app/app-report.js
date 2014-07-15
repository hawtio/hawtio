
var graph = "";
var htmlDeps = "";

graph += "digraph G {\n";
htmlDeps += "<table><thead><tr><th>Module</th><th>Dependencies</th></th><th>Controllers</th><th>Services</th><th>Factories</th><th>Directives</th><th>Filters</th><th>Values</th><th>Constants</th></tr></thead><tbody>";

// deps and reverse-deps between modules (m -> {m:1, m:1, ...})
var _m2m = {};
var _m2mr = {};

angular.forEach(_modules, function(v, k) {
  _m2m[v.moduleName] = {};
  _m2mr[v.moduleName] = {};
  angular.forEach(v.dependencies, function (d, dk) {
    _m2m[v.moduleName][d] = 1;
  });
  angular.forEach(v.otherDependencies, function (od, odk) {
    if (_definingModules[od] !== undefined) {
      // found indirect module->module dependency
      if (v.moduleName !== _definingModules[od].moduleName) {
      _m2m[v.moduleName][_definingModules[od].moduleName] = 1;
      }
    }
  });
});
angular.forEach(_m2m, function (v, k) {
  angular.forEach(v, function (v1, k1) {
    if (_m2mr[k1] === undefined) {
      _m2mr[k1] = {};
    }
    _m2mr[k1][k] = 1;
  });
});

angular.forEach(_modules, function(v, k) {
  htmlDeps += "<tr><td class='module-name'>" + v.moduleName + "</td>";
  htmlDeps += "<td><b>Uses</b>";
  htmlDeps += "<ul>";
  angular.forEach(_m2m[v.moduleName], function (v, k) {
    htmlDeps += "<li>" + k + "</li>";
  });
  htmlDeps += "</ul>";
  htmlDeps += "<b>Used by</b>";
  htmlDeps += "<ul>";
  angular.forEach(_m2mr[v.moduleName], function (v, k) {
    htmlDeps += "<li>" + k + "</li>";
  });
  htmlDeps += "</ul>";
  htmlDeps += "</td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.controllers, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.services, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.factories, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.directives, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.filters, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.valuesTab, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "<td><ul>";
  angular.forEach(v.constants, function(v, k) {
    htmlDeps += "<li>" + v + "</li>";
  });
  htmlDeps += "</ul></td>";
  htmlDeps += "</tr>";
});

var _externalModules = {};

graph += "    // hawt.io modules\n";
angular.forEach(_modules, function(v, k) {
  graph += "    \"" + v.moduleName + "\" [shape=ellipse]\n";
  angular.forEach(v.dependencies, function (d, dk) {
    _externalModules[d] = d;
  });
});
angular.forEach(_modules, function (v, k) {
  delete _externalModules[v.moduleName];
});
graph += "\n    // external modules\n";
angular.forEach(_externalModules, function(v, k) {
  graph += "    \"" + v + "\" [shape=ellipse, color=red]\n";
});

// to make dependencies (explicit/implicit) unique
var _uniq = {};

graph += "\n";
graph += "    // explicit dependencies\n";
angular.forEach(_modules, function(v, k) {
  angular.forEach(v.dependencies, function (d, dk) {
    var dep = v.moduleName + "\" -> \"" + d;
    _uniq[dep] = dep;
    graph += "    \"" + dep + "\"";
    graph += ";\n";
  });
});

// let's find indirect module dependencies (through services, factories, controllers, directives or filters)
graph += "\n    // implicit dependencies\n";
angular.forEach(_modules, function(v, k) {
  angular.forEach(v.otherDependencies, function (od, odk) {
    if (_definingModules[od] !== undefined) {
      // found indirect module->module dependency
      if (v.moduleName !== _definingModules[od].moduleName) {
        var dep = v.moduleName + "\" -> \"" + _definingModules[od].moduleName;
        if (_uniq[dep] === undefined) {
          _uniq[dep] = dep;
          graph += "    \"" + dep + "\" [color=green]\n";
        }
      }
    } else {
      // dependency on service/factory/... from unknown module
      //graph += "    \"" + v.moduleName + "\"] -> \"" + od + "\" [color=blue]\n";
    }
  });
});

htmlDeps += "</tbody></table>";
graph += "}\n";

$("#graph").html(graph);
$("#report").html(htmlDeps);
