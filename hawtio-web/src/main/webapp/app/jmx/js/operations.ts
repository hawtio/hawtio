/**
* @module Jmx
*/
/// <reference path="./jmxPlugin.ts"/>
/// <reference path="../../core/js/corePlugin.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../ui/js/CodeEditor.ts"/>
module Jmx {

  // IOperationControllerScope
  _module.controller("Jmx.OperationController", ["$scope", "workspace", "jolokia", "$timeout", "$location", "localStorage", "$browser", (
      $scope,
      workspace: Workspace,
      jolokia: Jolokia.IJolokia,
      $timeout: ng.ITimeoutService,
      $location: ng.ILocationService,
      localStorage: WindowLocalStorage,
      $browser) => {

    $scope.item = $scope.selectedOperation;
    $scope.title = $scope.item.humanReadable;
    $scope.desc = $scope.item.desc;
    $scope.operationResult = '';
    $scope.isExecuting = false;
    $scope.executeIcon = "icon-ok";
    $scope.mode = "text";
    $scope.entity = {};
    $scope.formConfig = {
      properties: {},
      description: $scope.objectName + "::" + $scope.item.name
    };

    var mbean = escapeMBean(workspace.getSelectedMBeanName());
    var url = $location.protocol() + "://" + $location.host() + ":" + $location.port() + $browser.baseHref();
    $scope.jolokiaUrl = url + localStorage["url"] + "/exec/" + mbean + "/" + $scope.item.name;

    function initItemArgs() {
      $scope.item.args.forEach((arg) => {
        switch (arg.type) {
          case "boolean":
            arg.value = false;
            break;
          default:
            arg.value = null;
        }
      });
    }

    // Initialise item args here to make sure it sends the correct number of args to Jolokia
    initItemArgs();

    $scope.item.args.forEach((arg) => {
      $scope.formConfig.properties[arg.name] = {
        type: arg.type,
        tooltip: arg.desc,
        help: "Type: " + arg.type
      }
    });

    $timeout(() => {
      $("html, body").animate({ scrollTop: 0 }, "medium");
    }, 250);

    var sanitize = (args) => {
      if (args) {
        args.forEach( function (arg) {
          switch (arg.type) {
            case "int":
            case "long":
              arg.formType = "number";
              break;
            default:
              arg.formType = "text";
          }
        });
      }

      return args;
    };

    $scope.args = sanitize($scope.item.args);


    $scope.dump = (data) => {
      console.log(data);
    };


    $scope.ok = () => {
      if ($scope.isExecuting) {
        log.debug("ok: rejected, operation still executing");
        return;
      }
      log.debug("ok: clear operation result");
      $scope.operationResult = '';
    };


    $scope.reset = () => {
      initItemArgs();
      $scope.entity = {};
    };

    $scope.close = () => {
      $scope.$parent.showInvoke = false;
    };


    $scope.handleResponse = (response) => {
      $scope.operationStatus = "success";

      if (response === null || 'null' === response) {
        $scope.operationResult = "Operation Succeeded!";
      } else if (typeof response === 'string') {
        $scope.operationResult = response;
      } else {
        $scope.operationResult = angular.toJson(response, true);
      }

      $scope.mode = CodeEditor.detectTextFormat($scope.operationResult);

      Core.$apply($scope);
      finishExecuting('success');
    };

    $scope.onSubmit = (json, form) => {
      log.debug("onSubmit: json:", json, " form: ", form);
      if ($scope.isExecuting) {
        log.debug("onSubmit: already executing");
        return;
      }
      startExecuting();

      log.debug("$scope.item.args: ", $scope.item.args);
      angular.forEach(json, (value, key) => {
        $scope.item.args.find((arg) => {
          return arg['name'] === key;
        }).value = value;
      });

      $timeout($scope.execute, 100);
    };


    $scope.execute = () => {
      log.debug("START: execute");
      var node = workspace.selection;
      var objectName = node.objectName;
      if (!node || !objectName) {
        finishExecuting('node or objectName null');
        return;
      }

      var args = [objectName, $scope.item.name];
      if ($scope.item.args) {
        $scope.item.args.forEach( function (arg) {
          args.push(arg.value);
        });
      }

      args.push(onSuccess($scope.handleResponse, {
        error: function (response) {
          $scope.operationStatus = "error";
          var error = response.error;
          $scope.operationResult = error;
          var stacktrace = response.stacktrace;
          if (stacktrace) {
            $scope.operationResult = stacktrace;
          }
          Core.$apply($scope);
          finishExecuting('error');
        }
      }));

      var fn = jolokia.execute;
      fn.apply(jolokia, args);
    };

    function startExecuting() {
      $scope.isExecuting = true;
      $scope.executeIcon = "icon-spinner icon-spin";
      Core.$apply($scope);
    }

    function finishExecuting(type: string) {
      $timeout(() => {
        log.debug("END: execute -", type);
        $scope.isExecuting = false;
        $scope.executeIcon = "icon-ok";
        Core.$apply($scope);
      }, 500);
    }


  }]);


  _module.controller("Jmx.OperationsController", ["$scope", "workspace", "jolokia", "rbacACLMBean", "$templateCache", (
      $scope,
      workspace: Workspace,
      jolokia: Jolokia.IJolokia,
      rbacACLMBean: ng.IPromise<string>,
      $templateCache: ng.ITemplateCacheService) => {

    $scope.operations = {};
    $scope.objectName = '';
    $scope.methodFilter = '';
    $scope.workspace = workspace;
    $scope.selectedOperation = null;
    $scope.showInvoke = false;
    $scope.template = "";

    $scope.invokeOp = (operation) => {
      if (!$scope.canInvoke(operation)) {
        return;
      }
      $scope.selectedOperation = operation;
      $scope.showInvoke = true;
    };

    $scope.getJson = (operation) => {
      return angular.toJson(operation, true);
    };

    $scope.cancel = () => {
      $scope.selectedOperation = null;
      $scope.showInvoke = false;
    };

    $scope.$watch('showInvoke', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue) {
          $scope.template = $templateCache.get("operationTemplate");
        } else {
          $scope.template = "";
        }
      }
    });

    var fetch = <() => void>Core.throttled(() => {
      var node = workspace.selection;
      if (!node) {
        return;
      }

      $scope.objectName = node.objectName;
      if (!$scope.objectName) {
        return;
      }

      jolokia.request({
        type: 'list',
        path: escapeMBeanPath($scope.objectName)
      }, onSuccess(render));
    }, 500);

    function getArgs(args) {
      return "(" + args.map(function(arg) {return arg.type}).join() + ")";
    }

    function sanitize (value) {
      for (var item in value) {
        item = "" + item;
        value[item].name = item;
        value[item].humanReadable = Core.humanizeValue(item);
      }
      return value;
    }

    $scope.isOperationsEmpty = () => {
      return $.isEmptyObject($scope.operations);
    };

    $scope.doFilter = (item) => {
      if (Core.isBlank($scope.methodFilter)) {
        return true;
      }
      if (item.name.toLowerCase().has($scope.methodFilter.toLowerCase())
          || item.humanReadable.toLowerCase().has($scope.methodFilter.toLowerCase())) {
        return true;
      }
      return false;
    };

    $scope.canInvoke = (operation) => {
      if (!('canInvoke' in operation)) {
        return true;
      } else {
        return operation['canInvoke'];
      }
    };

    $scope.getClass = (operation) => {
      if ($scope.canInvoke(operation)) {
        return 'can-invoke';
      } else {
        return 'cant-invoke';
      }
    };

    $scope.$watch('workspace.selection', (newValue, oldValue) => {
      if (!workspace.selection || workspace.moveIfViewInvalid()) {
        return;
      }
      fetch();
    });

    function fetchPermissions(objectName, operations) {
      var map = {};
      map[objectName] = [];

      angular.forEach(operations, (value, key) => {
        map[objectName].push(value.name);
      });

      rbacACLMBean.then((rbacACLMBean) => {
        jolokia.request({
          type: 'exec',
          mbean: rbacACLMBean,
          operation: 'canInvoke(java.util.Map)',
          arguments: [map]
        }, onSuccess((response) => {
          var map = response.value;
          angular.forEach(map[objectName], (value, key) => {
            operations[key]['canInvoke'] = value['CanInvoke'];
          });
          log.debug("Got operations: ", $scope.operations);
          Core.$apply($scope);
        }, {
          error: (response) => {
            // silently ignore
            log.debug("Failed to fetch ACL for operations: ", response);
            Core.$apply($scope);
          }
        }));
      });

    }

    function render(response) {
      var ops = response.value.op;
      var answer = {};

      angular.forEach(ops, function(value, key) {
        if (angular.isArray(value)) {
          angular.forEach(value, function(value, index) {
            answer[key + getArgs(value.args)] = value;
          });
        } else {
          answer[key + getArgs(value.args)] = value;
        }
      });
      $scope.operations = sanitize(answer);
      if ($scope.isOperationsEmpty()) {
        Core.$apply($scope);
      } else {
        fetchPermissions($scope.objectName, $scope.operations);
        Core.$apply($scope);
      }
    }

  }]);
}
