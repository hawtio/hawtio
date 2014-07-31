/// <reference path="../../baseIncludes.ts"/>
module Fabric {

  export var log:Logging.Logger = Logger.get("Fabric");

  export var jmxDomain = 'io.fabric8';
  export var managerMBean = Fabric.jmxDomain + ":type=Fabric";
  export var clusterManagerMBean = Fabric.jmxDomain + ":type=ClusterServiceManager";
  export var clusterBootstrapManagerMBean = Fabric.jmxDomain + ":type=ClusterBootstrapManager";
  export var openShiftFabricMBean = Fabric.jmxDomain + ":type=OpenShift";
  export var mqManagerMBean = Fabric.jmxDomain + ":type=MQManager";

  export var schemaLookupDomain = "hawtio";
  export var schemaLookupType = "SchemaLookup";

  export var schemaLookupMBean = schemaLookupDomain + ":type=" + schemaLookupType;
  export var useDirectoriesInGit = true;
  export var fabricTopLevel = "fabric/profiles/";
  export var profileSuffix = ".profile";
  export var jolokiaWebAppGroupId = jmxDomain + ".fabric-jolokia";

  export var currentContainerId = '';
  export var currentContainer = {};

  export var DEFAULT_REST_API = "/api/fabric8";

}
