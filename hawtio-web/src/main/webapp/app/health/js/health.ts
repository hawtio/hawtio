module Health {

    export function HealthController($scope, workspace:Workspace) {
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
      function defaultValues(values) {
        angular.forEach(values, (aData) => {
          var domain = aData["domain"];
          if (!domain) {
            var id = aData["healthId"];
            if (id) {
              var idx = id.lastIndexOf('.');
              if (idx > 0) {
                domain = id.substring(0, idx);
                var alias = Health.healthDomains[domain];
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
        });
        return values;
      }

      $scope.results = [];

      function asHealthQuery(meanInfo) {
        // TODO we may use custom operations for different mbeans...
        return {type: 'exec', mbean: meanInfo.objectName, operation: 'healthList()'};
      }

      function createOKStatus(object) {
        return {
          healthId: object.domain + ".status",
          level: "INFO",
          message: object.title + " is OK"
        };
      }

      $scope.$watch('workspace.selection', function () {
        if (workspace.moveIfViewInvalid()) return;

        var objects = getHealthMBeans(workspace);
        if (objects) {
          var jolokia = workspace.jolokia;
          if (angular.isArray(objects)) {
            var args = [];
            var onSuccessArray = [];

            function callback(response, object) {
              var value = response.value;
              if (value) {
                // TODO this smells like a standard function :)
                if (angular.isArray(value)) {
                  if (value.length > 0) {
                    angular.forEach(value, (item) => {
                      $scope.results.push(item);
                    });
                  } else {
                    $scope.results.push(createOKStatus(object));
                  }
                } else {
                  $scope.results.push(value);
                }
              } else {
                $scope.results.push(createOKStatus(object));
              }
            }

            angular.forEach(objects, (mbean) => {
              args.push(asHealthQuery(mbean));
              onSuccessArray.push((response) => callback(response, mbean));
            });
            // update the last result callback to update the UI
            onSuccessArray[onSuccessArray.length - 1] = (response) => {
              callback(response, objects.last);
              $scope.widget.populateTable(defaultValues($scope.results));
              $scope.$apply();
            };
            $scope.results = [];
            jolokia.request(args, onSuccess(onSuccessArray));
          } else {
            function populateTable(response) {
              var values = response.value;
              if (!values || values.length === 0) {
                values = [createOKStatus(objects)];
              }
              $scope.widget.populateTable(defaultValues(values));
              $scope.$apply();
            }
            jolokia.request(
                    asHealthQuery(objects),
                    onSuccess(populateTable));
          }
        }
      });

    }


}