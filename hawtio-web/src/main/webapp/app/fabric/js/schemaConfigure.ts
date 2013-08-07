module Fabric {


  export var createChildContainerOptions = (<any>window).org_fusesource_fabric_api_CreateChildContainerOptions;
  export var createJCloudsContainerOptions = (<any>window).org_fusesource_fabric_service_jclouds_CreateJCloudsContainerOptions;
  export var createSshContainerOptions = (<any>window).org_fusesource_fabric_service_ssh_CreateSshContainerOptions;
  export var createEnsembleOptions = (<any>window).org_fusesource_fabric_api_CreateEnsembleOptions;
  
  export var createContainerSchemas:any = [Fabric.createChildContainerOptions, Fabric.createJCloudsContainerOptions, Fabric.createSshContainerOptions];
  
  export var createEnsembleSchemas:any = [Fabric.createEnsembleOptions];
  
  export var allFabricSchemas:any = [Fabric.createChildContainerOptions, Fabric.createJCloudsContainerOptions, Fabric.createSshContainerOptions, Fabric.createEnsembleOptions];

  
  
  function configureResolverSchema() {
    var resolverEnum = ['localip', 'localhostname', 'publicip', 'publichostname'];

    Core.pathSet(createEnsembleOptions, ['properties', 'globalResolver', 'enum'], resolverEnum.clone());

    resolverEnum.push('manualip');

    (<any>[Fabric.createJCloudsContainerOptions,
           Fabric.createSshContainerOptions,
           Fabric.createEnsembleOptions]).each( (schema) => {

      Core.pathSet(schema, ['properties', 'resolver', 'enum'], resolverEnum.clone());
    });
  }

  /**
   * Configures the JSON schemas to improve the UI models
   */
  export function schemaConfigure() {

    delete createChildContainerOptions.properties['manualIp'];
    delete createChildContainerOptions.properties['preferredAddress'];
    delete createChildContainerOptions.properties['resolver'];
    delete createChildContainerOptions.properties['ensembleServer'];
    delete createChildContainerOptions.properties['proxyUri'];
    delete createChildContainerOptions.properties['adminAccess'];

    createChildContainerOptions.properties['jmxPassword']['type'] = 'password';

    createChildContainerOptions.properties['saveJmxCredentials'] = {
      'type': 'boolean'
    };


    (<any>[createJCloudsContainerOptions, createSshContainerOptions]).each((schema) => {
      delete schema.properties['parent'];
    });


    Fabric.createContainerSchemas.each((schema) => {
      Core.pathSet(schema, ["properties", "name", "required"], true);

      // clean up form
      delete schema.properties['metadataMap'];
      delete schema.properties['zookeeperUrl'];
      delete schema.properties['zookeeperPassword'];
      delete schema.properties['globalResolver'];
      delete schema.properties['zooKeeperServerPort'];
      delete schema.properties['agentEnabled'];
      delete schema.properties['autoImportEnabled'];
      delete schema.properties['importPath'];
      delete schema.properties['users'];

      Core.pathSet(schema, ['properties','providerType', 'type'], 'hidden');
      Core.pathSet(schema, ['properties','profiles', 'type'], 'hidden');
      Core.pathSet(schema, ['properties','version', 'type'], 'hidden');
    });

    angular.forEach(["jmxUser", "jmxPassword", "parent"], (name) => {
      Core.pathSet(Fabric.createChildContainerOptions, ["properties", name, "required"], true);
    });

    angular.forEach(["name", 'owner', 'credential'], (name) => {
      Core.pathSet(Fabric.createJCloudsContainerOptions, ["properties", name, "required"], true);
    });

    angular.forEach(["name", 'host'], (name) => {
      Core.pathSet(Fabric.createSshContainerOptions, ["properties", name, "required"], true);
    });

    angular.forEach(["username", "password", "role"], (name) => {
      Core.pathSet(Fabric.createEnsembleOptions, ["properties", name, "type"], 'string');
      Core.pathSet(Fabric.createEnsembleOptions, ["properties", name, "required"], true);
    });
    
    configureResolverSchema();
    
    Core.pathSet(Fabric.createEnsembleOptions, ['properties', 'password', 'password'], true);
    delete Fabric.createEnsembleOptions['properties']['users'];

    // use tabs to reorder the fields
    Fabric.createChildContainerOptions["tabs"] = {
      'Default': ['name', 'parent', 'jmxUser', 'jmxPassword', 'saveJmxCredentials', 'number', '*']
    };
    Fabric.createJCloudsContainerOptions["tabs"] = {
      'Default': ['name', 'owner', 'credential', 'imageId', 'hardwareId', 'locationId', 'number', '*']
    };
    Fabric.createSshContainerOptions["tabs"] = {
      'Default': ['name', 'host', 'port', 'userName', 'password', 'privateKeyFile', 'passPhrase', '*']
    };

    Fabric.createEnsembleOptions['tabs'] = {
      'Basic': ['username', 'password', 'role', 'zookeeperPassword', 'zooKeeperServerPort', 'globalResolver', 'resolver', 'manualIp'],
      'Advanced': ['*']
    };

  }
}
