/**
 * @module JUnit
 */
module JUnit {

  export var log:Logging.Logger = Logger.get("JUnit");

  /**
   * Returns true if the JUnit plugin is enabled (both the hawtio insight and JUnit mbeans are available
   */
  export function isJUnitPluginEnabled(workspace:Workspace, jolokia) {
    var enabled:boolean = getIntrospectorMBean(workspace) && getJUnitMBean(workspace) !== null;
    // we only want junit to be enabled if there is any junit tests
    if (enabled) {
      var mbean = getIntrospectorMBean(workspace) !== null;
      if (mbean) {
        enabled = jolokia.execute(mbean, "hasJUnitTests");
      }
    }
    return enabled;
  }

  export function getJUnitMBean(workspace: Workspace) {
    return Core.getMBeanTypeObjectName(workspace, "hawtio", "JUnitFacade");
  }

  export function getIntrospectorMBean(workspace: Workspace) {
    return Core.getMBeanTypeObjectName(workspace, "hawtio", "Introspector");
  }
}
