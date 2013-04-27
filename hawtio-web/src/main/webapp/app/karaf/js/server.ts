module Karaf {

    export function ServerController($scope, $location, workspace:Workspace, jolokia) {

      $scope.data = {
        name: "",
        version: "",
        state: "",
        root: "",
        location: "",
        sshPort: "",
        rmiRegistryPort: "",
        rmiServerPort: "",
        pid: ""};

      function render(response) {
        console.log("Response is " + response);

        // grab the first mbean as there should ideally only be one karaf in the JVM
        if (angular.isArray(response)) {
          var mbean = response[0];
          if (mbean) {
            var instances = jolokia.getAttribute(mbean, "Instances", onSuccess(null));
            if (instances) {
              console.log("Instances is " + instances);
              // the name is the first child
                $scope.data.name = "TODO";
                // TODO: we need to get version from another mbean
                $scope.data.version = "TODO";
                $scope.data.state = instances['root'].State;
                $scope.data.root = "TODO";
                $scope.data.location = instances['root'].Location;
                $scope.data.sshPort = "TODO";
                $scope.data.rmiRegistryPort = "TODO";
                $scope.data.rmiServerPort = "TODO";
                $scope.data.pid = instances['root'].Pid;
            }
          }
        }

        // ensure web page is updated
        Core.$apply($scope);
      }

      // TODO: we need the framework and version from another mbean

      function loadData() {
        console.log("Loading Karaf data...");
        jolokia.search("org.apache.karaf:type=admin,*", onSuccess(render));
      }

      $scope.$on('jmxTreeUpdated', reloadFunction);
      $scope.$watch('workspace.tree', reloadFunction);

      function reloadFunction() {
        // if the JMX tree is reloaded its probably because a new MBean has been added or removed
        // so lets reload, asynchronously just in case
        setTimeout(loadData, 50);
      }
    }

}