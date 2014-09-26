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
  export var log:Logging.Logger = Logger.get("RBAC");
  export var _module = angular.module(pluginName, ["hawtioCore"]);

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

  _module.run(["jolokia", "rbacTasks", "preLogoutTasks", "workspace", "$rootScope", (jolokia,
               rbacTasks,
               preLogoutTasks:Core.Tasks,
               workspace:Core.Workspace,
               $rootScope) => {

    preLogoutTasks.addTask("resetRBAC", () => {
      log.debug("Resetting RBAC tasks");
      rbacTasks.reset();
    });

    // add info to the JMX tree if we have access to invoke on mbeans
    // or not
    rbacTasks.addTask("JMXTreePostProcess", () => {
      workspace.addTreePostProcessor((tree) => {
        var mbeans = {};
        flattenMBeanTree(mbeans, tree);
        var requests = [];
        rbacTasks.getACLMBean().then((mbean) => {
          angular.forEach(mbeans, (value, key) => {
            if (!('canInvoke' in value)) {
              requests.push({
                type: 'exec',
                mbean: mbean,
                operation: 'canInvoke(java.lang.String)',
                arguments: [key]
              });
            }
          });
          var numResponses:number = 0;
          var maybeRedraw = () => {
            numResponses = numResponses + 1;
            if (numResponses >= requests.length) {
              workspace.redrawTree();
              Core.$apply($rootScope);
            }
          };
          jolokia.request(requests, onSuccess((response) => {
            var mbean = response.request.arguments[0];
            if (mbean) {
              mbeans[mbean]['canInvoke'] = response.value;
              var toAdd:string = "cant-invoke";
              if (response.value) {
                toAdd = "can-invoke";
              }
              mbeans[mbean]['addClass'] = stripClasses(mbeans[mbean]['addClass']);
              mbeans[mbean]['addClass'] = addClass(mbeans[mbean]['addClass'], toAdd);
              maybeRedraw();
            }
          }, {
            error: (response) => {
              // silently ignore, but still track if we need to redraw
              maybeRedraw();
            }
          }));
        });
      });
    });
  }]);
  hawtioPluginLoader.addModule(pluginName);
}

