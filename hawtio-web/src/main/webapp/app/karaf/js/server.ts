module Karaf {

  export function ServerController($scope, $location, workspace:Workspace, jolokia) {

    $scope.data = {
      name: "",
      version: "",
      state: "",
      root: "",
      startLevel: "",
      framework: "",
      frameworkVersion: "",
      location: "",
      sshPort: "",
      rmiRegistryPort: "",
      rmiServerPort: "",
      pid: ""};

    $scope.$on('jmxTreeUpdated', reloadFunction);
    $scope.$watch('workspace.tree', reloadFunction);

    function reloadFunction() {
      // if the JMX tree is reloaded its probably because a new MBean has been added or removed
      // so lets reload, asynchronously just in case
      setTimeout(loadData, 50);
    }

    function loadData() {
      console.log("Loading Karaf data...");
      jolokia.search("org.apache.karaf:type=admin,*", onSuccess(render));
    }

    function render(response) {
      // grab the first mbean as there should ideally only be one karaf in the JVM
      if (angular.isArray(response)) {
        var mbean = response[0];
        if (mbean) {
          jolokia.getAttribute(mbean, "Instances", onSuccess((response) => {
            onInstances(response, mbean);
          }));
        }
      }
    }

    function onInstances(instances, mbean) {
      if (instances) {

        var parsedMBean = Core.parseMBean(mbean);
        var instanceName = 'root';
        if ('attributes' in parsedMBean) {
          if ('name' in parsedMBean['attributes']) {
            instanceName = parsedMBean['attributes']['name'];
          }
        }

        //log.debug("mbean: ", Core.parseMBean(mbean));
        //log.debug("Instances: ", instances);

        // the name is the first child
        var rootInstance = instances[instanceName];
        $scope.data.name = rootInstance.Name;
        $scope.data.state = rootInstance.State;
        $scope.data.root = rootInstance["Is Root"];
        $scope.data.location = rootInstance.Location;
        $scope.data.sshPort = rootInstance["SSH Port"];
        $scope.data.rmiRegistryPort = rootInstance["RMI Registry Port"];
        $scope.data.rmiServerPort = rootInstance["RMI Server Port"];
        $scope.data.pid = rootInstance.Pid;

        // we need to get these data from the system mbean
        $scope.data.version = "?";
        $scope.data.startLevel = "?";
        $scope.data.framework = "?";
        $scope.data.frameworkVersion = "?";

        var systemMbean = "org.apache.karaf:type=system,name=" + rootInstance.Name;
        // get more data, and its okay to do this synchronously
        var response = jolokia.request({type: "read", mbean: systemMbean,
          attribute: ["StartLevel", "Framework", "Version"]}, onSuccess(null));

        var obj = response.value;
        if (obj) {
          $scope.data.version = obj.Version;
          $scope.data.startLevel = obj.StartLevel;
          $scope.data.framework = obj.Framework;
        }

        // and the osgi framework version is the bundle version
        var response2 = jolokia.search("osgi.core:type=bundleState,*", onSuccess(null));
        if (angular.isArray(response2)) {
          var mbean = response2[0];
          if (mbean) {
            // get more data, and its okay to do this synchronously
            var response3 = jolokia.request({type: 'exec', mbean: mbean, operation: 'getVersion(long)', arguments: [0]}, onSuccess(null));
            var obj3 = response3.value;
            if (obj3) {
              $scope.data.frameworkVersion = obj3;
            }
          }
        }
      }

      // ensure web page is updated
      Core.$apply($scope);
    }
  }
}
