
var graph = "";

graph += "digraph G {\n";

var _externalModules = {};

angular.forEach(_modules, function(v, k) {
  graph += "    \"" + v.moduleName + "\" [shape=ellipse]\n";
  angular.forEach(v.dependencies, function (d, dk) {
    _externalModules[d] = d;
  });
});
angular.forEach(_modules, function (v, k) {
  delete _externalModules[v.moduleName];
});
angular.forEach(_externalModules, function(v, k) {
  graph += "    \"" + v + "\" [shape=ellipse, color=red]\n";
});
// controllers
angular.forEach(_controllersMap, function(v, k) {
  graph += "    \"" + v + "\" [shape=box]\n";
});

graph += "\n";
angular.forEach(_modules, function(v, k) {
  angular.forEach(v.dependencies, function (d, dk) {
    graph += "    \"" + v.moduleName + "\" -> \"" + d + "\"";
    graph += ";\n";
  });
});
graph += "}\n";

$("#graph").html(graph);
