/**
 * @module RBAC
 * @main RBAC
 */
/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="rbacHelpers.ts"/>
/// <reference path="rbacTasks.ts"/>
module RBAC {

  export var pluginName:string = "hawtioRbac";
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  var TREE_POSTPROCESSOR_NAME = "rbacTreePostprocessor";

  _module.factory('rbacTasks', ["postLoginTasks", "jolokia", "$q",  (postLoginTasks:Core.Tasks, jolokia, $q:ng.IQService) => {

    RBAC.rbacTasks = new RBAC.RBACTasksImpl($q.defer());

    postLoginTasks.addTask("FetchJMXSecurityMBeans", () => {
      jolokia.request({
        type: 'search',
        mbean: '*:type=security,area=jmx,*'
      }, onSuccess((response) => {
        var mbeans = response.value;
        var chosen = "";
        if (mbeans.length === 0) {
          log.info("Didn't discover any JMXSecurity mbeans, client-side role based access control is disabled");
          return;
        } else if (mbeans.length === 1) {
          chosen = mbeans.first();
        } else if (mbeans.length > 1) {
          var picked = false;
          mbeans.forEach((mbean) => {
            if (picked) {
              return;
            }
            if (mbean.has("HawtioDummy")) {
              return;
            }
            if (!mbean.has("rank=")) {
              chosen = mbean;
              picked = true;
            }

          });
        }
        log.info("Using mbean ", chosen, " for client-side role based access control");
        RBAC.rbacTasks.initialize(chosen);
      }));
    });

    return RBAC.rbacTasks;
  }]);

  _module.factory('rbacACLMBean', ["rbacTasks", (rbacTasks) => {
    return rbacTasks.getACLMBean();
  }]);

  _module.run(["jolokia", "jolokiaStatus", "rbacTasks", "preLogoutTasks", "workspace", "$rootScope", (jolokia,
               jolokiaStatus,
               rbacTasks,
               preLogoutTasks:Core.Tasks,
               workspace:Core.Workspace,
               $rootScope) => {

    preLogoutTasks.addTask("resetRBAC", () => {
      log.debug("Resetting RBAC tasks");
      rbacTasks.reset();
      workspace.removeTreePostProcessors(TREE_POSTPROCESSOR_NAME);
    });

    // add info to the JMX tree if we have access to invoke on mbeans
    // or not
    rbacTasks.addTask("JMXTreePostProcess", () => {
      workspace.addTreePostProcessor((tree) => {
        rbacTasks.getACLMBean().then((mbean) => {
          // log.debug("JMX tree is: ", tree);
          var mbeans = {};
          flattenMBeanTree(mbeans, tree);
          // log.debug("Flattened MBeans: ", mbeans);
          var requests = [];
          var bulkRequest = {};
          if (jolokiaStatus.listMethod != Core.LIST_WITH_RBAC) {
            angular.forEach(mbeans, (value, key) => {
              if (!('canInvoke' in value)) {
                requests.push({
                  type: 'exec',
                  mbean: mbean,
                  operation: 'canInvoke(java.lang.String)',
                  arguments: [key]
                });
                if (value.mbean && value.mbean.op) {
                  var ops:Core.JMXOperations = value.mbean.op;
                  value.mbean.opByString = {};
                  var opList = [];
                  angular.forEach(ops, (op:any, opName:string) => {

                    function addOp(opName:string, op:Core.JMXOperation) {
                      var operationString = Core.operationToString(opName, op.args);
                      // enrich the mbean by indexing the full operation string so we can easily look it up later
                      value.mbean.opByString[operationString] = op;
                      opList.push(operationString);
                    }
                    if (angular.isArray(op)) {
                      (<Array<any>>op).forEach((op) => {
                        addOp(opName, op);
                      });

                    } else {
                      addOp(opName, op);
                    }
                  });
                  bulkRequest[key] = opList;
                }
              }
            });
            requests.push({
              type: 'exec',
              mbean: mbean,
              operation: 'canInvoke(java.util.Map)',
              arguments: [bulkRequest]
            });
            var numResponses:number = 0;
            var maybeRedraw = () => {
              numResponses = numResponses + 1;
              if (numResponses >= requests.length) {
                workspace.redrawTree();
                log.debug("Enriched workspace tree: ", tree);
                Core.$apply($rootScope);
              }
            };
            jolokia.request(requests, onSuccess((response) => {
              var mbean = response.request.arguments[0];
              if (mbean && angular.isString(mbean)) {
                mbeans[mbean]['canInvoke'] = response.value;
                var toAdd:string = "cant-invoke";
                if (response.value) {
                  toAdd = "can-invoke";
                }
                mbeans[mbean]['addClass'] = stripClasses(mbeans[mbean]['addClass']);
                mbeans[mbean]['addClass'] = addClass(mbeans[mbean]['addClass'], toAdd);
                maybeRedraw();
              } else {
                var responseMap = response.value;
                angular.forEach(responseMap, (operations, mbeanName) => {
                  angular.forEach(operations, (data, operationName) => {
                    mbeans[mbeanName].mbean.opByString[operationName]['canInvoke'] = data['CanInvoke'];
                  });
                });
                maybeRedraw();
              }
            }, {
              error: (response) => {
                // silently ignore, but still track if we need to redraw
                maybeRedraw();
              }
            }));
          } else {
            // we already have everything related to RBAC in place, except 'addClass' property
            angular.forEach(mbeans, (mbean, mbeanName) => {
              var toAdd:string = "cant-invoke";
              if (mbean.mbean && mbean.mbean.canInvoke) {
                toAdd = "can-invoke";
              }
              mbeans[mbeanName]['addClass'] = stripClasses(mbeans[mbeanName]['addClass']);
              mbeans[mbeanName]['addClass'] = addClass(mbeans[mbeanName]['addClass'], toAdd);
            });
          }
        });
      }, -1, TREE_POSTPROCESSOR_NAME);
    });
  }]);
  hawtioPluginLoader.addModule(pluginName);
}

