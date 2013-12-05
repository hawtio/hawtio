/**
 * @module JUnit
 */
module JUnit {

  export var log:Logging.Logger = Logger.get("JUnit");

  export function isJUnitPluginEnabled(workspace:Workspace) {
    return getIntrospectorMBean(workspace);
  }

  export function getIntrospectorMBean(workspace: Workspace) {
    return Core.getMBeanTypeObjectName(workspace, "io.hawt.introspect", "Introspector");
  }

}
