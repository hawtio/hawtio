/**
 * @module RBAC
 * @main RBAC
 */
module RBAC {

  export var pluginName:string = "hawtioRbac";
  export var log:Logging.Logger = Logger.get("RBAC");
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  _module.factory('rbacTasks', (postLoginTasks:Core.Tasks, jolokia) => {
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
  });

  _module.run((jolokia,
               rbacTasks,
               preLogoutTasks:Core.Tasks,
               workspace:Core.Workspace,
               $rootScope) => {

    preLogoutTasks.addTask("resetRBAC", () => {
      log.debug("Resetting RBAC tasks");
      rbacTasks.reset();
    });

    rbacTasks.addTask("init", () => {
      log.info("Initializing role based access support using mbean: ", rbacTasks.getACLMBean());
    });

    // add info to the JMX tree if we have access to invoke on mbeans
    // or not
    rbacTasks.addTask("JMXTreePostProcess", () => {
      workspace.addTreePostProcessor((tree) => {
        var mbeans = {};
        flattenMBeanTree(mbeans, tree);
        var requests = [];
        angular.forEach(mbeans, (value, key) => {
          if (!('canInvoke' in value)) {
            requests.push({
              type: 'exec',
              mbean: rbacTasks.getACLMBean(),
              operation: 'canInvoke(java.lang.String)',
              arguments: [key]
            });
          }
        });
        var numResponses:number = 0;
        jolokia.request(requests, onSuccess((response) => {
          var mbean = response.request.arguments[0];
          if (mbean) {
            mbeans[mbean]['canInvoke'] = response.value;
            var addClass:string = "cant-invoke";
            if (response.value) {
              addClass = "can-invoke";
            }
            if (Core.isBlank(mbeans[mbean]['addClass'])) {
              mbeans[mbean]['addClass'] = addClass;
            } else {
              mbeans[mbean]['addClass'] = mbeans[mbean]['addClass'] + " " + addClass;
            }
          }
          numResponses = numResponses + 1;
          if (numResponses >= requests.length) {
            workspace.redrawTree();
            Core.$apply($rootScope);
          }
        }));
      });
    });

  });

}

hawtioPluginLoader.addModule(RBAC.pluginName);
