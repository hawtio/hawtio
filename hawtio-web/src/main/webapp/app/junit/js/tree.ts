module JUnit {

  export function TreeController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia, inProgressStatus) {

    var log:Logging.Logger = Logger.get("JUnit");

    $scope.testClasses = [];
    $scope.testClassMap = {};

    $scope.gridOptions = {
      selectedItems: [],
      data: 'selectedTests',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: ''
      },
      //selectWithCheckboxOnly: true,
      showSelectionCheckbox: true,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Test Class'
          //cellTemplate: '<div class="ngCellText"><a ng-click="openMessageDialog(row)">{{row.entity.JMSMessageID}}</a></div>',
        }
      ]
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$on('jmxTreeUpdated', function () {
      reloadTree();
    });

    $scope.runAllTests = () => {
      runTests($scope.testClasses);
    };

    $scope.runTests = () => {
      var tests = ($scope.gridOptions.selectedItems || []).map(o => o.id);
      runTests(tests);
    };

    $scope.runTest = (className) => {
      if (className) {
        runTests([className]);
      }
    };


    $scope.clearResults = () => {
      $scope.testResults = null;
    };



    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#junittree"), true);
    }

    reloadTree();

    function selectionChanged(data) {
      var selectionKey = data ? data.key : null;
      log.debug("Selection is now: " + selectionKey);
      var selectedTests = $scope.testClasses;
      $scope.selectionKey = selectionKey;
      if (selectionKey) {
        selectedTests = $scope.testClassMap[selectionKey] || [selectionKey];
      }
      $scope.selectedTests = selectedTests.map(t => {
        return {id: t};
      });
      Core.$apply($scope);
    }

    function reloadTree() {
      var mbean = JUnit.getIntrospectorMBean(workspace);
      var domain = "org.unit";
      var rootFolder = new Folder("Test Cases");
      rootFolder.addClass = "testCases";
      rootFolder.typeName = "testCases";
      rootFolder.domain = domain;
      rootFolder.key = "";
      var children = [rootFolder];

      if (mbean) {
        function render(results) {
          $scope.testClasses = results;
          $scope.testClassMap = {};

          angular.forEach(results, (className) => {
            var paths = className.split(".");
            var last = paths.length - 1;
            var folder = rootFolder;
            var prefix = "";
            for (var i = 0; i < last; i++) {
              var path = paths[i];
              if (prefix) {
                prefix += ".";
              }
              prefix += path;
              var list = $scope.testClassMap[prefix];
              if (!list) {
                list = [];
                $scope.testClassMap[prefix] = list;
              }
              list.push(className);
              folder = workspace.folderGetOrElse(folder, path);
              folder.key = prefix;
            }
            var lastPath = paths[last];

            // lets add the test case...
            var testClass = new Folder(lastPath);
            testClass.addClass = "testClass";
            testClass.domain = domain;
            testClass.key = className;
            folder.children.push(testClass);
          });

          Core.$apply($scope);

          var treeElement = $("#junittree");
          Jmx.enableTree($scope, $location, workspace, treeElement, children, true, (selectedNode) => {
            var data = selectedNode.data;
            //$scope.select(data);
            //workspace.updateSelectionNode(data);
            selectionChanged(data);
            Core.$apply($scope);
          });
          // lets do this asynchronously to avoid Error: $digest already in progress
          setTimeout(updateSelectionFromURL, 50);
        }

        jolokia.execute(mbean, "findJUnitTestClassNames", onSuccess(render));
      }
    }

    function renderResults(results) {
      $scope.testResults = results;
      $scope.running = false;
      var alertClass = "error";
      if (results.successful) {
        alertClass = "success";
      } else if (!results.runCount) {
        alertClass = "warning";
      }
      $scope.alertClass = alertClass;
      Core.$apply($scope);
    }

    var renderInProgress = function (response) {
      var result = response.value;
      if (result) {
        log.debug("Render inProgress: " + result);

        $scope.inProgressResults = result;
        $scope.running = result.running;
        var alertClass = "success";

        if (result.successful) {
          alertClass = "success";
        } else {
          if (result.running) {
            alertClass = "warning";
          } else {
            alertClass = "error";
          }
        }
        $scope.alertClass = alertClass;

        // if we no longer are running then clear handle
        if (!result.running && inProgressStatus.jhandle !== null) {
          log.debug("Unit test done, unreigster jolokia handle")
          jolokia.unregister(inProgressStatus.jhandle)
          inProgressStatus.jhandle = null;
        }

        Core.$apply($scope);
      }
    };

    function runTests(listOfClassNames) {
      $scope.running = true;
      $scope.testResults = null;

      var mbean = getJUnitMBean(workspace);
      if (mbean && listOfClassNames && listOfClassNames.length) {

        // register callback for doing live update of testing progress
        if (inProgressStatus.jhandle === null) {
          log.debug("Registering jolokia handle")
          inProgressStatus.jhandle = jolokia.register(renderInProgress, {
            type: 'exec', mbean: mbean,
            operation: 'inProgress()',
            ignoreErrors: true,
            arguments: []
          });

          // execute the unit tests
          jolokia.execute(mbean, "runTestClasses", listOfClassNames, onSuccess(renderResults));
        }
      }
    }

  }
}