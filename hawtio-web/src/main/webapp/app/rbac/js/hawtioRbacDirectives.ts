/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="rbacPlugin.ts"/>
module RBAC {

  var MBEAN_ONLY = 'canInvoke(java.lang.String)';
  var OVERLOADED_METHOD = 'canInvoke(java.lang.String,java.lang.String)';
  var EXACT_METHOD = 'canInvoke(java.lang.String,java.lang.String,[Ljava.lang.String;)';

  var HIDE='hide';
  var REMOVE='remove';
  var INVERSE='inverse';

  function getOp(objectName:string, methodName:string, argumentTypes:string) {
    var answer:string = MBEAN_ONLY;
    if (!Core.isBlank(methodName)) {
      answer = OVERLOADED_METHOD;
    }
    if (!Core.isBlank(argumentTypes)) {
      answer = EXACT_METHOD;
    }
    return answer;
  }

  function getArguments(op, objectName, methodName, argumentTypes) {
    var arguments = [];
    if (op === MBEAN_ONLY) {
      arguments.push(objectName);
    } else if (op === OVERLOADED_METHOD) {
      arguments.push(objectName);
      arguments.push(methodName);
    } else if (op === EXACT_METHOD) {
      arguments.push(objectName);
      arguments.push(methodName);
      arguments.push(argumentTypes.split(',').map((s) => { return s.trim(); }));
    }
    return arguments;
  }

  /**
   * Directive that sets an element's visibility to hidden if the user cannot invoke the supplied operation
   * @type {ng.IModule|ng.ICompileProvider}
   */
  export var hawtioShow = _module.directive('hawtioShow', ['workspace', (workspace:Core.Workspace) => {
    return {
      restrict: 'A',
      replace: false,
      link: (scope:ng.IScope, element:ng.IAugmentedJQuery, attr:ng.IAttributes) => {
        var objectName = attr['objectName'];
        if (!objectName) {
          return;
        }
        function applyInvokeRights(value:boolean, mode:string) {
          if (value) {
            if (mode === INVERSE) {
              element.css({
                display: 'none'
              });
            }
          } else {
            if (mode === REMOVE) {
              element.css({
                display: 'none'
              });
            } else if (mode === HIDE) {
              element.css({
                visibility: 'hidden'
              });
            }
          }
        };
        scope.$watch(() => {
        var methodName = attr['methodName'];
        var argumentTypes = attr['argumentTypes'];
        var mode = attr['mode'] || HIDE;
        var op = getOp(objectName, methodName, argumentTypes);
        var args = getArguments(op, objectName, methodName, argumentTypes);
        objectName = args[0];
        methodName = args[1];
        if (objectName) {
          var mbean = Core.parseMBean(objectName);
          var folder = workspace.findMBeanWithProperties(mbean.domain, mbean.attributes);
          if (folder) {
            var invokeRights = workspace.hasInvokeRights(folder, methodName);
            /*
            if (invokeRights) {
              log.debug("User has invoke rights on mbean: ", objectName, " methodName: ", methodName);

            } else {
              log.debug("User does not have invoke rights on mbean: ", objectName, " methodName: ", methodName);

            }
            */
            applyInvokeRights(invokeRights, mode);
          }
        }
        });
      }
    };
  }]);

}
