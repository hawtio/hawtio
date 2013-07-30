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

    var tmp = (<any>window).org_fusesource_fabric_api_CreateEnsembleOptions;

    angular.forEach(["username", "password", "role"], (name) => {
      Core.pathSet(tmp, ["properties", name, "type"], 'string');
      Core.pathSet(tmp, ["properties", name, "required"], true);
    });

    var resolverEnum = ['localip', 'localhostname', 'publicip', 'publichostname', 'manualip'];

    angular.forEach([org_fusesource_fabric_api_CreateChildContainerOptions, org_fusesource_fabric_api_CreateJCloudsContainerOptions, org_fusesource_fabric_api_CreateSshContainerOptions, tmp], (schema) => {
      angular.forEach(['globalResolver', 'resolver'], (name) => {
        Core.pathSet(tmp, ['properties', name, 'enum'], resolverEnum);
      });
    });

    Core.pathSet(tmp, ['properties', 'password', 'password'], true);
    delete tmp['properties']['users'];

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

    tmp['tabs'] = {
      'Basic': ['username', 'password', 'role', 'zookeeperPassword', 'zooKeeperServerPort', 'globalResolver', 'resolver', 'manualIp'],
      'Advanced': ['*']
    };

  }
}
