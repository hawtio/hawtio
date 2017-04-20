/// Copyright 2014-2015 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///   http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.

var Example;
(function (Example) {
    Example.pluginName = "hawtio-assembly";
    Example.log = Logger.get(Example.pluginName);
    Example.templatePath = "plugins/example/html";
})(Example || (Example = {}));

var Example;
(function (Example) {
    Example._module = angular.module(Example.pluginName, []);
    var tab = undefined;
    Example._module.config(["$locationProvider", "$routeProvider", "HawtioNavBuilderProvider",
        function ($locationProvider, $routeProvider, builder) {
            tab = builder.create()
                .id(Example.pluginName)
                .title(function () { return "Example"; })
                .href(function () { return "/example"; })
                .subPath("Page 1", "page1", builder.join(Example.templatePath, "page1.html"))
                .build();
            builder.configureRouting($routeProvider, tab);
            $locationProvider.html5Mode(true);
        }]);
    Example._module.run(["HawtioNav", function (HawtioNav) {
            HawtioNav.add(tab);
            Example.log.debug("loaded");
        }]);
})(Example || (Example = {}));

var Example;
(function (Example) {
    Example.Page1Controller = Example._module.controller("Example.Page1Controller", ["$scope", function ($scope) {
            $scope.target = "World!";
        }]);
})(Example || (Example = {}));

angular.module('hawtio-console-assembly-templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('plugins/example/html/page1.html','<div class="row">\n  <div class="col-md-12" ng-controller="Example.Page1Controller">\n    <h1>Page 1</h1>\n    <p class=\'customClass\'>Hello {{target}}</p>\n  </div>\n</div>\n');}]); hawtioPluginLoader.addModule("hawtio-console-assembly-templates");