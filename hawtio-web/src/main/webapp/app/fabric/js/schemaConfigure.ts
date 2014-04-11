module Fabric {

  /**
   * Returns the resolvers for the given schema id (child, ssh, jclouds, openshift, docker)
   */
  export function getResolvers(id) {
    var answer;
    switch (id) {
      case 'child': answer = []; break;
      case 'ssh': answer = ['localip', 'localhostname', 'publicip', 'publichostname', 'manualip']; break;
      case 'jclouds': answer = ['localip', 'localhostname', 'publicip', 'publichostname', 'manualip']; break;
      case 'openshift': answer = []; break;
      case 'docker': answer = []; break;
    }
    return answer;
  }

  export function customizeSchema(id, schema) {

    // console.log("Schema: ", schema);

    Core.pathSet(schema, ["properties", "name", "required"], true);
    Core.pathSet(schema, ['properties', 'name', 'input-attributes', 'ng-pattern'], "/^[a-zA-Z0-9_-]*$/");

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

    ['zooKeeperServerInitLimit',
      'zooKeeperServerTickTime',
      'zooKeeperServerSyncLimit',
      'zooKeeperServerDataDir',
      'waitForProvision',
      'ensembleStart',
      'migrationTimeout',
      'dataStoreProperties'].forEach((attr) => {
      Core.pathSet(schema, ['properties', attr, 'control-attributes', 'ng-show'], 'entity.ensembleServer');
    });

    Core.pathSet(schema, ['properties','providerType', 'type'], 'hidden');
    Core.pathSet(schema, ['properties','profiles', 'type'], 'hidden');
    Core.pathSet(schema, ['properties','version', 'type'], 'hidden');

    Core.pathSet(schema.properties, ['name', 'label'], 'Container Name');
    Core.pathSet(schema.properties, ['name', 'tooltip'], 'Name of the container to create (or prefix of the container name if you create multiple containers)');

    Core.pathSet(schema.properties, ['number', 'label'], 'Number of containers');
    Core.pathSet(schema.properties, ['number', 'tooltip'], 'The number of containers to create; when set higher than 1 a number will be appended to each container name');
    Core.pathSet(schema.properties, ['number', 'input-attributes', 'min'], '1');

    // mark properties as autofill to avoid issues with angular missing autofill events
    Core.pathSet(schema.properties, ['login', 'input-attributes', "autofill"], "true");
    Core.pathSet(schema.properties, ['password', 'input-attributes', "autofill"], "true");

    Core.pathSet(schema.properties, ['jmxUser', 'input-attributes', "autofill"], "true");
    Core.pathSet(schema.properties, ['jmxUser', 'tooltip'], 'The username for connecting to the container using JMX');

    Core.pathSet(schema.properties, ['jmxPassword', 'input-attributes', "autofill"], "true");
    Core.pathSet(schema.properties, ['jmxPassword', 'tooltip'], 'The password for connecting to the container using JMX');

    Core.pathSet(schema.properties, ['resolver', 'input-element'], "select");
    Core.pathSet(schema.properties, ['resolver', 'input-attributes', "ng-options"], "r for r in resolvers");

    switch (id) {
      case 'child':
        delete schema.properties['manualIp'];
        delete schema.properties['preferredAddress'];
        delete schema.properties['resolver'];
        delete schema.properties['ensembleServer'];
        delete schema.properties['proxyUri'];
        delete schema.properties['adminAccess'];
        delete schema.properties['minimumPort'];
        delete schema.properties['maximumPort'];
        schema.properties['jmxPassword']['type'] = 'password';
        schema.properties['saveJmxCredentials'] = {
          'type': 'boolean'
        };
        Core.pathSet(schema.properties, ['saveJmxCredentials', 'tooltip'], 'Remember credentials when connecting to container (avoid prompting user to enter credentials)');

        Core.pathSet(schema.properties, ['parent', 'label'], 'Parent Container');
        Core.pathSet(schema.properties, ['parent', 'tooltip'], 'The name of the parent container used to create the child container');
        Core.pathSet(schema.properties, ['parent', 'input-element'], "select");
        Core.pathSet(schema.properties, ['parent', 'input-attributes', "ng-options"], "c for c in child.rootContainers");

        bulkSet(schema, ["jmxUser", "jmxPassword", "parent"], 'required', true);
        schema['tabs'] = {
          'Common': ['name', 'parent', 'jmxUser', 'jmxPassword', 'saveJmxCredentials', 'number'],
          'Advanced': ['*']
        };
        break;

      case 'ssh':
        delete schema.properties['jmxUser'];
        delete schema.properties['jmxPassword'];
        delete schema.properties['parent'];

        bulkSet(schema, ['host'], 'required', true);
        Core.pathSet(schema.properties, ['password', 'type'], 'password');

        schema['tabs'] = {
          'Common': ['name', 'host', 'port', 'username', 'password', 'privateKeyFile', 'passPhrase'],
          'Advanced': ['*']
        };
        break;

      case 'jclouds':
        delete schema.properties['jmxUser'];
        delete schema.properties['jmxPassword'];
        delete schema.properties['parent'];

        schema['tabs'] = {
          'Common': ['name', 'owner', 'credential', 'providerName', 'imageId', 'hardwareId', 'locationId', 'number', 'instanceType'],
          'Advanced': ['*']
        };
        break;

      case 'openshift':
        delete schema.properties['jmxUser'];
        delete schema.properties['jmxPassword'];
        delete schema.properties['parent'];
        delete schema.properties['manualIp'];
        delete schema.properties['preferredAddress'];
        delete schema.properties['ensembleServer'];
        delete schema.properties['proxyUri'];
        delete schema.properties['adminAccess'];
        delete schema.properties['path'];
        delete schema.properties['bindAddress'];
        delete schema.properties['hostNameContext'];
        delete schema.properties['resolver'];

        schema.properties['serverUrl']['default'] = 'openshift.redhat.com';

        // openshift must select publichostname as the resolver
        Core.pathSet(schema.properties, ['resolver', 'default'], 'publichostname');
        Core.pathSet(schema.properties, ['serverUrl', 'label'], 'OpenShift Broker');
        Core.pathSet(schema.properties, ['serverUrl', 'tooltip'], 'The OpenShift broker host name of the cloud to create the container inside. This is either the URL for your local OpenShift Enterprise installation, or its the public OpenShift online URL: openshift.redhat.com');
        Core.pathSet(schema.properties, ['login', 'label'], 'OpenShift Login');
        Core.pathSet(schema.properties, ['login', 'tooltip'], 'Your personal login to the OpenShift portal');
        Core.pathSet(schema.properties, ['login', 'input-attributes', "autofill"], "true");
        Core.pathSet(schema.properties, ['password', 'label'], 'OpenShift Password');
        Core.pathSet(schema.properties, ['password', 'tooltip'], 'Your personal password on the OpenShift portal');
        Core.pathSet(schema.properties, ['password', 'type'], 'password');

        // openshift only allows lowercase a-z and numbers
        Core.pathSet(schema.properties, ['name', 'input-attributes', 'ng-pattern'], "/^[a-z0-9]*$/");

        // add an extra property to make it easy to login
/*
*/
/*
        Core.pathSet(schema.properties, ['tryLogin', 'label'], 'Try');
*/
/*
        Core.pathSet(schema.properties, ['tryLogin', 'input-element'], "button");
        Core.pathSet(schema.properties, ['tryLogin', 'input-attributes', "class"], "btn");
        Core.pathSet(schema.properties, ['tryLogin', 'input-attributes', "ng-click"], "openShift.login()");
*/
        //Core.pathSet(schema.properties, ['tryLogin', 'input-attributes', "ng-disable"], "!entity.login || !entity.password || !entity.serverUrl");
/*
*/
        Core.pathSet(schema.properties, ['tryLogin', 'type'], 'string');
        Core.pathSet(schema.properties, ['tryLogin', 'input-attributes', "ng-model"], "openShift.tryLogin");
        Core.pathSet(schema.properties, ['tryLogin', 'label'], 'Authenticate');
        Core.pathSet(schema.properties, ['tryLogin', 'tooltip'], 'Authenticate with the OpenShift Broker using your login and password');
        Core.pathSet(schema.properties, ['tryLogin', 'formTemplate'], '<a ng-click="openShift.login()" ng-disabled="!entity.login || !entity.password || !entity.serverUrl" ' +
          'title="Test you entered the correct OpenShift Broker, login and password" class="btn btn-primary">Login to OpenShift</a>' +
          '<div class="alert" ng-show="openShift.loginFailed" ' +
          'title="Are you sure you correctly entered the OpenShift Broker, login and password correctly?">Login failed</div>');
/*
        Core.pathSet(schema.properties, ['tryLogin', 'formTemplate'], '<button ng-click="openShift.login()" title="Test you entered the correct OpenShift Broker, login and password">Try Login</button>');
*/

        Core.pathSet(schema.properties, ['domain', 'label'], 'OpenShift Domain');
        Core.pathSet(schema.properties, ['domain', 'tooltip'], 'What is your unique domain name used for applications you create on OpenShift. Often this is your own user name or group name');
        Core.pathSet(schema.properties, ['domain', 'input-element'], "select");
        Core.pathSet(schema.properties, ['domain', 'input-attributes', "ng-options"], "c for c in openShift.domains");

        Core.pathSet(schema.properties, ['gearProfile', 'tooltip'], 'Which kind of gear to create');
        Core.pathSet(schema.properties, ['gearProfile', 'input-element'], "select");
        Core.pathSet(schema.properties, ['gearProfile', 'input-attributes', "ng-options"], "c for c in openShift.gearProfiles");

        bulkSet(schema, ['serverUrl', 'login', 'password', 'domain'], 'required', true);
        schema['tabs'] = {
          'Common': ['name', 'serverUrl', 'login', 'password', 'tryLogin', 'domain', 'gearProfile', 'number'],
          'Advanced': ['environmentalVariables', 'systemProperties', 'jvmOpts', '*']
        };
        break;

      case 'docker':
        delete schema.properties['jmxUser'];
        delete schema.properties['jmxPassword'];
        delete schema.properties['parent'];
        delete schema.properties['manualIp'];
        delete schema.properties['preferredAddress'];
        delete schema.properties['resolver'];
        delete schema.properties['ensembleServer'];
        delete schema.properties['proxyUri'];
        delete schema.properties['adminAccess'];
        delete schema.properties['path'];
        delete schema.properties['bindAddress'];
        delete schema.properties['hostNameContext'];

        schema['tabs'] = {
          'Common': ['name', 'number'],
          'Advanced': ['environmentalVariables', 'systemProperties', 'jvmOpts', '*']
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

  function setGlobalResolverEnum(schema) {
    var globalResolverEnum = ['localip', 'localhostname', 'publicip', 'publichostname'];
    Core.pathSet(schema, ['properties', 'globalResolver', 'enum'], globalResolverEnum);
  }

}
