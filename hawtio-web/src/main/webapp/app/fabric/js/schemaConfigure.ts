module Fabric {

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

    Core.pathSet(schema, ['properties','providerType', 'type'], 'hidden');
    Core.pathSet(schema, ['properties','profiles', 'type'], 'hidden');
    Core.pathSet(schema, ['properties','version', 'type'], 'hidden');

    Core.pathSet(schema.properties, ['name', 'label'], 'Container Name');
    Core.pathSet(schema.properties, ['name', 'tooltip'], 'Name of the container to create (or prefix of the container name if you create multiple containers)');

    Core.pathSet(schema.properties, ['number', 'tooltip'], 'The number of containers to create');

    // mark properties as autofill to avoid issues with angular missing autofill events
    Core.pathSet(schema.properties, ['login', 'input-attributes', "autofill"], "true");
    Core.pathSet(schema.properties, ['password', 'input-attributes', "autofill"], "true");
    Core.pathSet(schema.properties, ['jmxUser', 'input-attributes', "autofill"], "true");
    Core.pathSet(schema.properties, ['jmxPassword', 'input-attributes', "autofill"], "true");

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
        delete schema.properties['parent'];

        bulkSet(schema, ['host'], 'required', true);
        Core.pathSet(schema.properties, ['password', 'type'], 'password');

        schema['tabs'] = {
          'Common': ['name', 'host', 'port', 'username', 'password', 'privateKeyFile', 'passPhrase'],
          'Advanced': ['*']
        };
        break;

      case 'jclouds':
        delete schema.properties['parent'];
        schema['tabs'] = {
          'Common': ['name', 'owner', 'credential', 'providerName', 'imageId', 'hardwareId', 'locationId', 'number', 'instanceType'],
          'Advanced': ['*']
        };
        break;

      case 'openshift':
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


        schema.properties['serverUrl']['default'] = 'openshift.redhat.com';
        Core.pathSet(schema.properties, ['resolver', 'default'], 'publichostname');

        Core.pathSet(schema.properties, ['serverUrl', 'label'], 'OpenShift Broker');
        Core.pathSet(schema.properties, ['serverUrl', 'tooltip'], 'The OpenShift broker host name of the cloud to create the container inside. This is either the URL for your local OpenShift Enterprise installation, or its the public OpenShift online URL: openshift.redhat.com');


        Core.pathSet(schema.properties, ['login', 'label'], 'OpenShift Login');
        Core.pathSet(schema.properties, ['login', 'tooltip'], 'Your personal login to the OpenShift portal');
        Core.pathSet(schema.properties, ['login', 'input-attributes', "autofill"], "true");
        Core.pathSet(schema.properties, ['password', 'label'], 'OpenShift Password');
        Core.pathSet(schema.properties, ['password', 'tooltip'], 'Your personal password on the OpenShift portal');
        Core.pathSet(schema.properties, ['password', 'type'], 'password');

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

      /*
      case 'createEnsemble':
        delete schema['properties']['name'];
        angular.forEach(["username", "password", "role", "zookeeperPassword"], (name) => {
          Core.pathSet(schema, ["properties", name, "type"], 'string');
          Core.pathSet(schema, ["properties", name, "required"], true);
        });

        setGlobalResolverEnum(schema);
        setResolverEnum(schema);

        Core.pathSet(schema, ["properties", "profiles", "type"], "hidden");
        Core.pathSet(schema, ['properties', 'password', 'type'], "password");
        Core.pathSet(schema, ['properties', 'zookeeperPassword', 'type'], "password");

        delete schema['properties']['users'];

        schema['tabs'] = {
          'Common': ['username', 'password', 'role', 'zookeeperPassword', 'zooKeeperServerPort', 'globalResolver', 'resolver', 'manualIp'],
          'Advanced': ['*']
        };
        */

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

  function setResolverEnum(schema) {
    var resolverEnum = ['localip', 'localhostname', 'publicip', 'publichostname', 'manualip'];
    Core.pathSet(schema, ['properties', 'resolver', 'enum'], resolverEnum);
  }
  
}
