module Fabric {

  /**
   * Configures the JSON schemas to improve the UI models
   */
  export function schemaConfigure() {
    angular.forEach(["name", "jmxUser", "jmxPassword"], (name) => {
      Core.pathSet(org_fusesource_fabric_api_CreateChildContainerOptions, ["properties", name, "required"], true);
    });
  }
}
