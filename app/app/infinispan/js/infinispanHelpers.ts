/**
 * @module Infinispan
 */
module Infinispan {

  /**
   * Returns the name of the cache from the mbean results
   * @method infinispanCacheName
   * @for Infinispan
   * @param {any} entity
   * @return {String}
   */
  export function infinispanCacheName(entity) {
    // there's no name in the MBean so lets extract it from the JMX ObjectName
    if (entity) {
      var id = entity._id;
      if (id) {
        var prefix = 'name="';
        var idx = id.indexOf(prefix);
        if (idx > 0) {
          idx += prefix.length;
          var lastIdx = id.indexOf('"', idx + 1);
          if (lastIdx > 0) {
            return id.substring(idx, lastIdx);
          } else {
            return id.substring(idx);
          }
        }
      }
      return id;
    }
    return null;
  }

  /**
   * Returns the MBean ObjectName for the interpreter
   * @method getInterpreterMBean
   * @for Infinispan
   * @param {Workspace} workspace
   * @return {String}
   */
  export function getInterpreterMBean(workspace:Workspace) {
    if (workspace) {
      var folder = workspace.findMBeanWithProperties(Infinispan.jmxDomain, {component: "Interpreter", type: "CacheManager"});
      if (folder) {
        return folder.objectName;
      }
    }
    return null;
  }

  export function getSelectedCacheName(workspace:Workspace) {
    var selection = workspace.selection;
    if (selection && selection.domain === Infinispan.jmxDomain) {
      // lets get the cache name
      return selection.entries["name"];
    }
    return null;
  }
}
