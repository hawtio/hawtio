module Fabric {

  export function CreateBrokerController($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) {

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.defaultGroup = "default";
    $scope.defaultBrokerName = "brokerName";

    $scope.groups = [];
    $scope.possibleNetworks = [];
    $scope.profiles = [];
    $scope.parentProfiles = [];
    $scope.entity = {
      group: $scope.defaultGroup
    };
    $scope.otherEntity = {
      networkConnectAll: false
    };

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


    function updatePossibleNetworks() {
      var group = $scope.entity.group;
      $scope.possibleNetworks = [].concat($scope.groups);
      if (group) {
        $scope.possibleNetworks = $scope.possibleNetworks.remove(group);
      }
    }

    $scope.$watch("entity.group", updatePossibleNetworks);
    $scope.$watch("otherEntity.networkConnectAll", () => {
      if ($scope.otherEntity.networkConnectAll) {
        $scope.entity.networks = $scope.possibleNetworks;
      }
    });


    // default parameters from the URL
    angular.forEach(["group", "profile"], (param) => {
      var value = $routeParams[param];
      if (value) {
        $scope.entity[param] = value;
      }
    });
    if (!$scope.entity.kind) {
      $scope.entity.kind = "MasterSlave";
    }

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

      var isReplicated = "entity.kind == 'Replicated'";
      var isStandalone = "entity.kind == 'StandAlone'";


      Core.pathSet(schema.properties, ['group', 'required'], true);
      Core.pathSet(schema.properties, ['group', 'tooltip'], 'The peer group name of message brokers. The group is name is used by messaging clients to connect to a broker; so it represents a peer group of brokers used for load balancing.');
      Core.pathSet(schema.properties, ['group', 'input-attributes', 'typeahead'], 'title for title in groups | filter:$viewValue');
      Core.pathSet(schema.properties, ['group', 'input-attributes', 'typeahead-editable'], 'true');

      Core.pathSet(schema.properties, ['brokerName', 'required'], true);
      Core.pathSet(schema.properties, ['brokerName', 'tooltip'], 'The name of the broker.');
      Core.pathSet(schema.properties, ['brokerName', 'input-attributes', 'autofocus'], 'true');

      Core.pathSet(schema.properties, ['parentProfile', 'tooltip'], 'The parent profile used by the profile.');
      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', 'typeahead'], 'p.id for p in parentProfiles | filter:$viewValue');
      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', 'typeahead-editable'], 'false');
      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', "placeholder"], "{{" + isReplicated + " ? 'mq-replicated' : 'mq-base'}}");

      Core.pathSet(schema.properties, ['profile', 'tooltip'], 'The profile to create instances of this broker.');
      Core.pathSet(schema.properties, ['profile', 'input-attributes', 'typeahead'], 'title for title in profiles | filter:$viewValue');
      Core.pathSet(schema.properties, ['profile', 'input-attributes', 'typeahead-editable'], 'true');
      Core.pathSet(schema.properties, ['profile', 'input-attributes', "placeholder"], "mq-broker-{{entity.group || 'default'}}.{{entity.brokerName || 'brokerName'}}");

      Core.pathSet(schema.properties, ['clientProfile', 'tooltip'], 'The profile used by messaging clients to connect to this group of brokers.');
      Core.pathSet(schema.properties, ['clientProfile', 'input-attributes', 'typeahead'], 'title for title in profiles | filter:$viewValue');
      Core.pathSet(schema.properties, ['clientProfile', 'input-attributes', 'typeahead-editable'], 'true');
      Core.pathSet(schema.properties, ['clientProfile', 'input-attributes', "placeholder"], "mq-client-{{entity.group || 'default'}}");

      Core.pathSet(schema.properties, ['clientParentProfile', 'tooltip'], 'The parent profile used by the client profile.');
      Core.pathSet(schema.properties, ['clientParentProfile', 'input-attributes', 'typeahead'], 'p.id for p in parentProfiles | filter:$viewValue');
      Core.pathSet(schema.properties, ['clientParentProfile', 'input-attributes', 'typeahead-editable'], 'false');
      Core.pathSet(schema.properties, ['parentProfile', 'input-attributes', "placeholder"], "default");



      Core.pathSet(schema.properties, ['data', 'input-attributes', "placeholder"], "${karaf.base}/data/{{entity.brokerName || 'brokerName'}}");
      Core.pathSet(schema.properties, ['configUrl', 'input-attributes', "placeholder"], "profile:broker.xml");

      Core.pathSet(schema.properties, ['replicas', 'control-group-attributes', "ng-show"], isReplicated);
      Core.pathSet(schema.properties, ['replicas', 'input-attributes', "placeholder"], "3");
      Core.pathSet(schema.properties, ['minimumInstances', 'control-group-attributes', "ng-hide"], isReplicated);
      Core.pathSet(schema.properties, ['minimumInstances', 'input-attributes', "placeholder"], "{{" + isStandalone + " ? 1 : 2}}");

      Core.pathSet(schema.properties, ['networksPassword', 'type'], 'password');
      Core.pathSet(schema.properties, ['networks', 'items', 'input-attributes', 'typeahead-editable'], 'true');
      Core.pathSet(schema.properties, ['networks', 'input-attributes', "ng-hide"], "otherEntity.networkConnectAll");
      Core.pathSet(schema.properties, ['networks', 'tooltip'], 'The broker groups to create a store and forward network to');

      // add an extra property to make it easy to connect to all / none
      Core.pathSet(schema.properties, ['networkConnectAll', 'type'], 'boolean');
      Core.pathSet(schema.properties, ['networkConnectAll', 'input-attributes', 'ng-model'], "otherEntity.networkConnectAll");
      Core.pathSet(schema.properties, ['networkConnectAll', 'label'], 'Network to all groups');
      Core.pathSet(schema.properties, ['networkConnectAll', 'tooltip'], 'Should this broker create a store and forward network to all the known groups of brokers');

      schema['tabs'] = {
        'Default': ['group', 'brokerName', 'kind', 'profile', 'clientProfile', 'data', 'configUrl', 'replicas', 'minimumInstances', 'networkConnectAll', 'networks'],
        'Advanced': ['parentProfile', 'clientParentProfile', 'networksUserName', 'networksPassword', '*']
      };
    }

    function onBrokerData(brokerStatuses) {
      var networkNames = brokerStatuses.map(s => s.networks).flatten().unique();
      var groups = brokerStatuses.map(s => s.group).unique();

      $scope.groups = networkNames.concat(groups).unique().sort();
      $scope.profiles = brokerStatuses.map(s => s.profile).unique().sort();
      $scope.brokerNames = brokerStatuses.map(s => s.brokerName).unique().sort();

      updatePossibleNetworks();

      var version = brokerStatuses.map(s => s.version).find(s => s) || "1.0";
      if (version) {
        jolokia.execute(Fabric.managerMBean, "getProfiles(java.lang.String,java.util.List)", version, ["id", "abstract"], onSuccess(onProfileData));

      }
      Core.$apply($scope);
    }

    function onProfileData(profileData) {
      if (profileData) {
        $scope.parentProfiles = profileData.filter(p => !p.abstract).sortBy("id");
      }
    }

    function onSave(response) {
      notification("success", "Created broker " + $scope.message);
      // now lets switch to the brokers view
      $location.path("/fabric/mq/brokers");
      Core.$apply($scope);
    }
  }
}
