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

/// <reference path="../../includes.ts"/>
/// <reference path="exampleGlobals.ts"/>
module DevExample {

  export var _module = angular.module(DevExample.pluginName, []);

  var tab = undefined;

  _module.config(["$locationProvider", "$routeProvider", "HawtioNavBuilderProvider",
    ($locationProvider, $routeProvider: ng.route.IRouteProvider, builder: HawtioMainNav.BuilderFactory) => {
    tab = builder.create()
      .id(DevExample.pluginName)
      .title(() => "Test DevExample")
      .href(() => "/test_example")
      .subPath("Page 1", "page1", builder.join(DevExample.templatePath, "page1.html"))
      .build();
    builder.configureRouting($routeProvider, tab);
  }]);

  _module.run(["HawtioNav", (HawtioNav: HawtioMainNav.Registry) => {
    HawtioNav.add(tab);
    log.debug("loaded");
  }]);


  // hawtioPluginLoader.addModule(DevExample.pluginName);
}
