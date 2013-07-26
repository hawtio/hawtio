module Fabric {

  /**
   * Configures the JSON schemas to improve the UI models
   */
  export function schemaConfigure() {
    angular.forEach(["name", "jmxUser", "jmxPassword"], (name) => {
      Core.pathSet(org_fusesource_fabric_api_CreateChildContainerOptions, ["properties", name, "required"], true);
    });
    angular.forEach(["name", "user", "password"], (name) => {
      Core.pathSet(org_fusesource_fabric_api_CreateJCloudsContainerOptions, ["properties", name, "required"], true);
    });
    angular.forEach(["name", "user", "password"], (name) => {
      Core.pathSet(org_fusesource_fabric_api_CreateSshContainerOptions, ["properties", name, "required"], true);
    });

    // use tabs to reorder the fields
    org_fusesource_fabric_api_CreateChildContainerOptions["tabs"] = {
      'Default': ['name', '*']
    };
    org_fusesource_fabric_api_CreateJCloudsContainerOptions["tabs"] = {
      'Default': ['name', '*']
    };
    org_fusesource_fabric_api_CreateJCloudsContainerOptions["tabs"] = {
      'Default': ['name', '*']
    };

  }
}
