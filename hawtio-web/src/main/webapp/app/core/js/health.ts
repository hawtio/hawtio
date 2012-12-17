var _healthDomains = {
  "org.apache.activemq": "ActiveMQ",
  "org.apache.camel": "Camel",
  "org.fusesource.fabric": "Fabric"
};

function HealthController($scope, workspace:Workspace) {
  $scope.widget = new TableWidget($scope, workspace, [
    {
      "mDataProp": null,
      "sClass": "control center",
      "mData": null,
      "sDefaultContent": '<i class="icon-plus"></i>'
    },
    {
      "mDataProp": "level",
      "sDefaultContent": "",
      "mData": null
    },
/*
    {
      "mRender": (data, type, row) => {
        if (row) {
          var id = row["healthId"];
          if (id) {
            var idx = id.lastIndexOf('.');
            if (idx > 0) {
              var answer = id.substring(0, idx);
              var alias = _healthDomains[answer];
              if (alias) {
                return alias;
              }
              return answer;
            }
          }
        }
        return "";
      }
    },
*/
    {
      "mDataProp": "domain",
      "sDefaultContent": "",
      "mData": null
    },
    {
      "mDataProp": "kind",
      "sDefaultContent": "",
      "mData": null
    },
    {
      "mDataProp": "message",
      "sDefaultContent": "",
      "mData": null,
      "sWidth": "60%"
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

  /**
   * Default the values that are missing in the returned JSON
   */
  function defaultValues(aData) {
    var domain = aData["domain"];
    if (!domain) {
      var id = aData["healthId"];
      if (id) {
        var idx = id.lastIndexOf('.');
        if (idx > 0) {
          domain = id.substring(0, idx);
          var alias = _healthDomains[domain];
          if (alias) {
            domain = alias;
          }
          var kind = aData["kind"];
          if (!kind) {
            kind = humanizeValue(id.substring(idx + 1));
            aData["kind"] = kind;
          }
        }
      }
      aData["domain"] = domain;
    }
    return aData;
  }

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
              angular.forEach(value, (item) => {
                $scope.results.push(defaultValues(item));
              });
            } else {
              $scope.results.push(defaultValues(value));
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
