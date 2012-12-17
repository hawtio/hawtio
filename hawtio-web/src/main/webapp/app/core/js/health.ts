function HealthController($scope, workspace:Workspace) {
  $scope.widget = new TableWidget($scope, workspace, [
    {
      "mDataProp": null,
      "sClass": "control center",
      "mData": null,
      "sDefaultContent": '<i class="icon-plus"></i>'
/*
    }, {
      "mDataProp": "level",
      "sDefaultContent": "",
      "mData": null
*/
    }, {
      "mDataProp": "message",
      "sDefaultContent": "",
      "mData": null
    }
  ], {
      rowDetailTemplateId: 'bodyTemplate',
      disableAddColumns: true
    });

  $scope.widget.dataTableConfig["fnRowCallback"] = (nRow, aData, iDisplayIndex, iDisplayIndexFull) => {
    var level = aData["level"];
    var style = logLevelClass(level);
    if (style) {
      $(nRow).addClass(style);
    }
  };

  $scope.results = [];

  function asHealthQuery(meanInfo) {
    // TODO we may use custom operations for different mbeans...
    return {type: 'exec', mbean: meanInfo.objectName, operation: 'healthList()'};
  }

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    var objects = getHealthMBeans(workspace);
    if (objects) {
      var jolokia = workspace.jolokia;
      if (angular.isArray(objects)) {
        var args = [];
        var onSuccessArray = [];
        function callback(response) {
          var value = response.value;
          if (value) {
            // TODO this smells like a standard function :)
            if (angular.isArray(value)) {
              $scope.results = $scope.results.concat(value);
            } else {
              $scope.results.push(value);
            }
          } else {
            // TODO empty values should add a row!!!
          }
        }

        angular.forEach(objects, (mbean) => {
          args.push(asHealthQuery(mbean));
          onSuccessArray.push(callback);
        });
        // update the last result callback to update the UI
        onSuccessArray[onSuccessArray.length - 1] = (response) => {
          callback(response);
          $scope.widget.populateTable($scope.results);
          $scope.$apply();
        };
        $scope.results = [];
        jolokia.request(args, onSuccess(onSuccessArray));
/*
        args.push(onSuccess(onSuccessArray));
        var fn = jolokia.request;
        fn.apply(jolokia, args);
*/
      } else {
        jolokia.request(
                asHealthQuery(objects),
                onSuccess(populateTable));
      }
    }
  });

  var populateTable = function (response) {
    // TODO empty values should add a row!!!
    $scope.widget.populateTable(response.value);
    $scope.$apply();
  };
}


/**
 * Returns the bundle MBean
 */
function getHealthMBeans(workspace:Workspace) {
  var broker = null;
  if (workspace) {
    var healthMap = workspace.mbeanTypesToDomain["Health"] || {};
    var selection = workspace.selection;
    if (selection) {
      var domain = selection.domain;
      if (domain) {
        var mbean = healthMap[domain];
        if (mbean) {
          return mbean;
        }
      }
    }
    if (healthMap) {
      // lets append all the mbeans together from all the domains
      var answer = [];
      angular.forEach(healthMap, (value) => {
        if (angular.isArray(value)) {
          answer = answer.concat(value);
        } else {
          answer.push(value)
        }
      });
      return answer;
    } else return null;
  }
}
