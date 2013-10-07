module Fabric {

  export function CreateBrokerController($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.groups = [];
    $scope.profiles = [];
    $scope.parentProfiles = [];
    $scope.entity = {};
    $scope.defaultGroup = "default";
    $scope.defaultBrokerName = "brokerName";

    // holds all the form objects from nested child scopes
    $scope.forms = {};

    $scope.onSubmit = (json, form) => {
      $scope.message = ($scope.entity.brokerName || "unknown") + " in group " + ($scope.entity.group || "unknown");
      notification("info", "Creating broker " + $scope.message);
      var json = JSON.stringify($scope.entity, null, '  ');
      jolokia.execute(Fabric.mqManagerMBean, "saveBrokerConfigurationJSON", json, onSuccess(onSave));
    };

    $scope.brokerNameExists = () => {
      var name = $scope.entity.brokerName;
      return name && $scope.brokerNames.indexOf(name) >= 0;
    };

    // default parameters from the URL
    angular.forEach(["group", "profile"], (param) => {
      var value = $routeParams[param];
      if (value) {
        $scope.entity[param] = value;
      }
    });

    Fabric.getDtoSchema("brokerConfig", "org.fusesource.fabric.api.jmx.MQBrokerConfigDTO", jolokia, (schema) => {
      $scope.schema = schema;
      configureSchema(schema);
      jolokia.execute(Fabric.mqManagerMBean, "loadBrokerStatus()", onSuccess(onBrokerData));
      Core.$apply($scope);
    });

    function configureSchema(schema) {
      delete schema.properties['username'];
      delete schema.properties['password'];

      // avoid the properties field for now as we don't yet have a generated UI for key/value pairs...
      delete schema.properties['properties'];

      Core.pathSet(schema.properties, ['group', 'required'], true);
      Core.pathSet(schema.properties, ['group', 'tooltip'], 'The peer group name of message brokers. The group is name is used by messaging clients to connect to a broker; so it represents a peer group of brokers used for load balancing.');
      Core.pathSet(schema.properties, ['group', 'input-attributes', 'typeahead'], 'title for title in groups | filter:$viewValue');
      Core.pathSet(schema.properties, ['group', 'input-attributes', 'typeahead-editable'], 'true');

      Core.pathSet(schema.properties, ['brokerName', 'required'], true);
      Core.pathSet(schema.properties, ['brokerName', 'tooltip'], 'The name of the broker.');

      Core.pathSet(schema.properties, ['profile', 'tooltip'], 'The name of the profile for this broker. If left blank it will be created from the group and broker names.');
      Core.pathSet(schema.properties, ['profile', 'input-attributes', 'typeahead'], 'title for title in profiles | filter:$viewValue');
      Core.pathSet(schema.properties, ['profile', 'input-attributes', 'typeahead-editable'], 'true');

      Core.pathSet(schema.properties, ['parentProfile', 'tooltip'], 'The profile used to define the version of A-MQ which will run, the features and the configuration of the broker.');
      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', 'typeahead'], 'title for title in parentProfiles | filter:$viewValue');
      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', 'typeahead-editable'], 'false');


      Core.pathSet(schema.properties, ['profile', 'input-attributes', "placeholder"], "mq-{{entity.group || 'default'}}-{{entity.brokerName || 'brokerName'}}");

      var isReplicated = "entity.kind == 'replicated'";

      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', "placeholder"], "{{" + isReplicated + " ? 'mq-replicated' : 'mq-base'}}");
      Core.pathSet(schema.properties, ['data', 'input-attributes', "placeholder"], "${karaf.base}/data/{{entity.brokerName || 'brokerName'}}");
      Core.pathSet(schema.properties, ['configUrl', 'input-attributes', "placeholder"], "profile:broker.xml");

      Core.pathSet(schema.properties, ['replicas', 'control-group-attributes', "ng-show"], isReplicated);
      Core.pathSet(schema.properties, ['minimumInstances', 'control-group-attributes', "ng-hide"], isReplicated);

      Core.pathSet(schema.properties, ['networksPassword', 'type'], 'password');

      schema['tabs'] = {
        'Default': ['group', 'kind', 'brokerName', 'profile', 'parentProfile', 'data', 'configUrl', 'replicas', 'minimumInstances'],
        'Advanced': ['*']
      };
    }

    function onBrokerData(brokerStatuses) {
      $scope.groups = brokerStatuses.map(s => s.group).unique().sort();
      $scope.profiles = brokerStatuses.map(s => s.profile).unique().sort();
      $scope.brokerNames = brokerStatuses.map(s => s.brokerName).unique().sort();
      Core.$apply($scope);
    }

    function onSave(response) {
      notification("success", "Created broker " + $scope.message);
      // now lets switch to the brokers view
      $location.path("/fabric/brokers");
      Core.$apply($scope);
    }
  }
}
