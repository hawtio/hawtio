module Fabric {

  export function customizeSchema(id, schema) {

    Core.pathSet(schema, ["properties", "name", "required"], true);

    delete schema.properties['metadataMap'];
    delete schema.properties['zookeeperUrl'];
    delete schema.properties['zookeeperPassword'];
    delete schema.properties['globalResolver'];
    delete schema.properties['zooKeeperServerPort'];
    delete schema.properties['zooKeeperServerConnectionPort'];
    delete schema.properties['agentEnabled'];
    delete schema.properties['autoImportEnabled'];
    delete schema.properties['importPath'];
    delete schema.properties['users'];

    Core.pathSet(schema, ['properties','providerType', 'type'], 'hidden');
    Core.pathSet(schema, ['properties','profiles', 'type'], 'hidden');
    Core.pathSet(schema, ['properties','version', 'type'], 'hidden');

    setResolverEnum(schema);

    switch (id) {
      case 'child':
        delete schema.properties['manualIp'];
        delete schema.properties['preferredAddress'];
        delete schema.properties['resolver'];
        delete schema.properties['ensembleServer'];
        delete schema.properties['proxyUri'];
        delete schema.properties['adminAccess'];
        schema.properties['jmxPassword']['type'] = 'password';
        schema.properties['saveJmxCredentials'] = {
          'type': 'boolean'
        };

        bulkSet(schema, ["jmxUser", "jmxPassword", "parent"], 'required', true);
        schema['tabs'] = {
          'Default': ['name', 'parent', 'jmxUser', 'jmxPassword', 'saveJmxCredentials', 'number', '*']
        };
        break;
      case 'ssh':
        delete schema.properties['parent'];

        bulkSet(schema, ['host'], 'required', true);
        schema['tabs'] = {
          'Default': ['name', 'host', 'port', 'userName', 'password', 'privateKeyFile', 'passPhrase', '*']
        };
        break;
      case 'jcloud':
        delete schema.properties['parent'];

        bulkSet(schema, ['owner', 'credential'], 'required', true);
        schema['tabs'] = {
          'Default': ['name', 'owner', 'credential', 'imageId', 'hardwareId', 'locationId', 'number', '*']
        };
        break;
      default:
    }

    return schema;

  }

  function bulkSet(schema, properties, field, value) {
    properties.each((name) => {
      Core.pathSet(schema, ['properties', name, field], value);
    })
  }

  export var createEnsembleOptions = (<any>window).org_fusesource_fabric_api_CreateEnsembleOptions;

  function setGlobalResolverEnum(schema) {
    var globalResolverEnum = ['localip', 'localhostname', 'publicip', 'publichostname'];
    Core.pathSet(schema, ['properties', 'globalResolver', 'enum'], globalResolverEnum);
  }

  function setResolverEnum(schema) {
    var resolverEnum = ['localip', 'localhostname', 'publicip', 'publichostname', 'manualip'];
    Core.pathSet(schema, ['properties', 'resolver', 'enum'], resolverEnum);
  }
  
  
  function configureResolverSchema() {
    setGlobalResolverEnum(createEnsembleOptions);
    setResolverEnum(createEnsembleOptions);
  }

  /**
   * Configures the JSON schemas to improve the UI models
   */
  export function schemaConfigure() {

    angular.forEach(["username", "password", "role"], (name) => {
      Core.pathSet(Fabric.createEnsembleOptions, ["properties", name, "type"], 'string');
      Core.pathSet(Fabric.createEnsembleOptions, ["properties", name, "required"], true);
    });
    
    configureResolverSchema();
    
    Core.pathSet(Fabric.createEnsembleOptions, ['properties', 'password', 'password'], true);
    delete Fabric.createEnsembleOptions['properties']['users'];

    Fabric.createEnsembleOptions['tabs'] = {
      'Basic': ['username', 'password', 'role', 'zookeeperPassword', 'zooKeeperServerPort', 'globalResolver', 'resolver', 'manualIp'],
      'Advanced': ['*']
    };

  }
}
