module Karaf {

  export function ServerController($scope, $location, workspace:Workspace, jolokia) {

    $scope.data = {
      name: "",
      version: "",
      state: "",
      root: "",
      startLevel: "",
      framework: "",
      location: "",
      sshPort: "",
      rmiRegistryPort: "",
      rmiServerPort: "",
      pid: ""};

    $scope.$on('jmxTreeUpdated', reloadFunction);
    $scope.$watch('workspace.tree', reloadFunction);

    // TODO: we need the framework and version from another mbean

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
          jolokia.getAttribute(mbean, "Instances", onSuccess(onInstances));
        }
      }
    }

    function onInstances(instances) {
      if (instances) {
        // console.log("Instances is " + JSON.stringify(instances));

        // the name is the first child
        var rootInstance = instances['root'];
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

        var systemMbean = "org.apache.karaf:type=system,name=" + rootInstance.Name;
        var response = jolokia.request({type: "read", mbean: systemMbean,
          attribute: ["StartLevel", "Framework", "Version"]}, onSuccess(null));

        var obj = response.value;
        if (obj) {
          $scope.data.version = obj.Version;
          $scope.data.startLevel = obj.StartLevel;
          $scope.data.framework = obj.Framework;
        }
      }

      // ensure web page is updated
      Core.$apply($scope);
    }
  }
}