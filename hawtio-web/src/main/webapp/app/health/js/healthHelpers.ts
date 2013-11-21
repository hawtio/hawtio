module Health {

  export var log:Logging.Logger = Logger.get("Health");

  export var healthDomains = {
    "org.apache.activemq": "ActiveMQ",
    "org.apache.camel": "Camel",
    "org.fusesource.fabric": "Fabric"
  };

  export function hasHealthMBeans(workspace:Workspace) {
    var beans = getHealthMBeans(workspace);
    if (beans) {
      if (angular.isArray(beans)) return beans.length >= 1;
      return true;
    }
    return false;
  }

  /**
   * Returns the health MBeans
   */
  // TODO Make into a service
  export function getHealthMBeans(workspace:Workspace) {
    if (workspace) {
      var healthMap = workspace.mbeanServicesToDomain["Health"] || {};
      var selection = workspace.selection;
      if (selection) {
        var domain = selection.domain;
        if (domain) {
          var mbean = healthMap[domain];
          if (mbean) {
            return mbean;
          }
        }
      }
      if (healthMap) {
        // lets append all the mbeans together from all the domains
        var answer = [];
        angular.forEach(healthMap, (value) => {
          if (angular.isArray(value)) {
            answer = answer.concat(value);
          } else {
            answer.push(value)
          }
        });
        return answer;
      } else return null;
    }
  }
}
