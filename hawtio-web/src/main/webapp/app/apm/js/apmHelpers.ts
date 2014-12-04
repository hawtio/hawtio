/**
 * @module Apm
 */
module Apm {

  export var log:Logging.Logger = Logger.get("Apm");

  export var jmxDomain = 'io.fabric8.apmagent';
  export var agentMBean = jmxDomain + ':type=apmAgent';

}
