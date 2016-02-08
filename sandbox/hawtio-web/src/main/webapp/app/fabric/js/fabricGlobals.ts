/// <reference path="../../baseIncludes.ts"/>
module Fabric {

  export var log:Logging.Logger = Logger.get("Fabric");
  /**
   * fabric8's top level JMX domain
   * @type {string}
   */
  export var jmxDomain = 'io.fabric8';

  /**
   * Main mbean used to manage a fabric
   * @type {string}
   */
  export var managerMBean = Fabric.jmxDomain + ":type=Fabric";

  /**
   * mbean that provides functions related to managing the zookeeper ensemble
   * @type {string}
   */
  export var clusterManagerMBean = Fabric.jmxDomain + ":type=ClusterServiceManager";

  /**
   * Provides functions to bootstrap a fabric
   * @type {string}
   */
  export var clusterBootstrapManagerMBean = Fabric.jmxDomain + ":type=ClusterBootstrapManager";

  /**
   * Provides function specific to a fabric in openshift
   * @type {string}
   */
  export var openShiftFabricMBean = Fabric.jmxDomain + ":type=OpenShift";

  /**
   * Provides functions related to managing brokers in a fabric
   * @type {string}
   */
  export var mqManagerMBean = Fabric.jmxDomain + ":type=MQManager";

  /**
   * Provides functions related to querying a fabric's health
   * @type {string}
   */
  export var healthMBean = Fabric.jmxDomain + ":service=Health";

  /**
   * The top-level domain for the schema lookup mbean
   * @type {string}
   */
  export var schemaLookupDomain = "hawtio";
  export var schemaLookupType = "SchemaLookup";

  /**
   * Provides functions to convert Java types to JSON schema at runtime
   * @type {string}
   */
  export var schemaLookupMBean = schemaLookupDomain + ":type=" + schemaLookupType;


  export var useDirectoriesInGit = true;

  export var fabricTopLevel = "fabric/profiles/";
  export var profileSuffix = ".profile";
  export var jolokiaWebAppGroupId = jmxDomain + ".fabric-jolokia";

  export var currentContainerId = '';
  export var currentContainer = {};

  export var DEFAULT_REST_API:string = "/api/fabric8";

}
