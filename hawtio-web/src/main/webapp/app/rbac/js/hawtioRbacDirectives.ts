/// <reference path="rbacPlugin.ts"/>
module RBAC {

  var MBEAN_ONLY = 'canInvoke(java.lang.String)';
  var OVERLOADED_METHOD = 'canInvoke(java.lang.String,java.lang.String)';
  var EXACT_METHOD = 'canInvoke(java.lang.String,java.lang.String,[Ljava.lang.String;)';

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

  /**
   * Directive that sets an element's visibility to hidden if the user cannot invoke the supplied operation
   * @type {ng.IModule|ng.ICompileProvider}
   */
  export var hawtioShow = _module.directive('hawtioShow', ['jolokia', 'rbacACLMBean', 'rbacTasks', (jolokia, rbacACLMBean:ng.IPromise<string>, rbacTasks:RBAC.RBACTasks) => {
    return {
      restrict: 'A',
      replace: false,
      link: (scope:ng.IScope, element:ng.IAugmentedJQuery, attr:ng.IAttributes) => {
        rbacACLMBean.then((rbacACLMBean:string) => {
          var objectName = attr['objectName'];
          if (!objectName) {
            return;
          }
          var methodName = attr['methodName'];
          var argumentTypes = attr['argumentTypes'];
          var op = getOp(objectName, methodName, argumentTypes);
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
          log.debug("Arguments for operation: ", arguments);
          log.debug("ACL MBean: ", rbacACLMBean);

          var success = (response) => {
            var value = <boolean>response.value;
            if (value) {
              log.debug("User can invoke: ", response.request.arguments);
            } else {
              log.debug("User cannot invoke: ", response.request.arguments);
              element.css({
                visibility: 'hidden'
              });
            }
          };

          var error = (response) => {
            log.debug("got error checking permission: ", response);
          };

          jolokia.request({
            type: 'exec',
            mbean: rbacACLMBean,
            operation: op,
            arguments: arguments
          }, onSuccess(success, {
            error: error
          }));

        });
      }
    }
  }]);

}
