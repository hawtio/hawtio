/**
 * @module RBAC
 * @main RBAC
 */
module RBAC {

  export var pluginName:string = "hawtioRbac";
  export var log:Logging.Logger = Logger.get("RBAC");
  export var _module = angular.module(pluginName, ["hawtioCore"]);

  _module.factory('rbacTasks', (postLoginTasks:Core.PostLoginTasks, jolokia) => {
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

  _module.run((jolokia, rbacTasks) => {

    rbacTasks.addTask("init", () => {
      log.info("Initializing role based access support using mbean: ", rbacTasks.getACLMBean());
    });

  });

}

hawtioPluginLoader.addModule(RBAC.pluginName);
