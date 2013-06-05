module Camel {

  export function initEndpointChooserScope($scope, workspace:Workspace, jolokia) {
    $scope.selectedComponentName = null;
    $scope.endpointParameters = {};
    $scope.schema = {
      definitions: {
      }
    };

    var silentOptions = {silent: true};

    $scope.$watch('workspace.selection', function () {
      workspace.moveIfViewInvalid();
      $scope.loadEndpointNames();
    });

    $scope.$watch('selectedComponentName', () => {
      if ($scope.selectedComponentName !== $scope.loadedComponentName) {
        $scope.endpointParameters = {};
        $scope.loadEndpointSchema($scope.selectedComponentName);
        $scope.loadedComponentName = $scope.selectedComponentName;
      }
    });

    $scope.endpointCompletions = () => {
      var answer = [];
      var mbean = Camel.getSelectionCamelContextMBean(workspace);
      var componentName = $scope.selectedComponentName;
      var endpointParameters = {};
      var completionText = $scope.endpointPath || "";
      if (mbean && componentName && completionText) {
        answer = jolokia.execute(mbean, 'completeEndpointPath', componentName, endpointParameters, completionText, onSuccess(null, silentOptions));
      }
      return answer;
    };

    $scope.loadEndpointNames = () => {
      $scope.componentNames = null;
      var mbean = Camel.getSelectionCamelContextMBean(workspace);
      if (!mbean && $scope.findProfileCamelContext) {
        // TODO as a hack for now lets just find any camel context we can
        var folder = Core.getMBeanTypeFolder(workspace, Camel.jmxDomain, "context");
        mbean = Core.pathGet(folder, ["objectName"]);
      }
      if (mbean) {
        jolokia.execute(mbean, 'findComponentNames', onSuccess(onComponents, silentOptions));
      } else {
        console.log("WARNING: No camel context mbean so cannot load component names");
      }
    };

    function onComponents(response) {
      $scope.componentNames = response;
      $scope.hasComponentNames = $scope.componentNames ? true : false;
      Core.$apply($scope);
    }

    $scope.loadEndpointSchema = (componentName) => {
      var mbean = Camel.getSelectionCamelContextMBean(workspace);
      if (mbean && componentName) {
        jolokia.execute(mbean, 'componentParameterJsonSchema', componentName, onSuccess(onEndpointSchema, silentOptions));
      }
    };

    function onEndpointSchema(response) {
      if (response) {
        try {
          //console.log("got JSON: " + response);
          var json = JSON.parse(response);
          $scope.endpointSchema = json;
          $scope.schema.definitions[$scope.selectedComponentName] = json;
          Core.$apply($scope);
        } catch (e) {
          console.log("Failed to parse JSON " + e);
          console.log("JSON: " + response);
        }
      }
    }
  }
}