module Health {

    export function HealthController($scope, jolokia, workspace:Workspace, $templateCache) {

      $scope.widget = new TableWidget($scope, workspace, [
        <TableColumnConfig> {
          "mDataProp": null,
          "sClass": "control center",
          "mData": null,
          "sDefaultContent": '<i class="icon-plus"></i>'
        },
        <TableColumnConfig> {
          "mDataProp": "level",
          "sDefaultContent": "",
          "mData": null
        },
        <TableColumnConfig> {
          "mDataProp": "domain",
          "sDefaultContent": "",
          "mData": null
        },
        <TableColumnConfig> {
          "mDataProp": "kind",
          "sDefaultContent": "",
          "mData": null
        },
        <TableColumnConfig> {
          "mDataProp": "message",
          "sDefaultContent": "",
          "mData": null,
          "sWidth": "60%"
        }
      ], {
        rowDetailTemplateId: 'healthEventTemplate',
        disableAddColumns: true
      });

      $scope.widget.dataTableConfig["fnRowCallback"] = (nRow, aData, iDisplayIndex, iDisplayIndexFull) => {
        var level = aData["level"];
        var style = logLevelClass(level);
        if (style) {
          $(nRow).addClass(style);
        }
      };

      $scope.levelSorting = {
        'ERROR': 0,
        'WARNING': 1,
        'INFO': 2,
      };

      $scope.colorMaps = {
        'ERROR': {
          'Health': '#ff0a47',
          'Remaining': '#e92614'
        },
        'WARNING': {
          'Health': '#33cc00',
          'Remaining': '#f7ee09'
        },
        'INFO': {
          'Health': '#33cc00',
          'Remaining': '#00cc33'
        }
      }

      $scope.results = [];

      $scope.responses = {};

      $scope.mbeans = [];

      $scope.displays = [];
      $scope.page = '';

      $scope.render = (response) => {
        //log.debug("Got response: ", response);
        var mbean = response.request.mbean;
        var values = response.value;

        var responseJson = angular.toJson(values);

        if (mbean in $scope.responses) {
          if ($scope.responses[mbean] === responseJson) {
            return;
          }
        }

        $scope.responses[mbean] = responseJson;

        var display = $scope.displays.find((m) => { return m.mbean === mbean });

        values = defaultValues(values);

        values = values.sortBy((value) => {
          if (!value.level) {
            return 99;
          }
          return $scope.levelSorting[value.level];
        });

        values.forEach((value) => {
            value.data = {
              total: 1,
              terms: [{
                term: 'Health',
                count: value.healthPercent
              }, {
                term: 'Remaining',
                count: 1 - value.healthPercent
              }]
            };
            value.colorMap = $scope.colorMaps[value.level];
        });

        if (!display) {
          $scope.displays.push({
            mbean: mbean,
            values: values
          });
        } else {
          display.values = values;
        }

        log.debug("Display: ", $scope.displays);
        if ($scope.page === '') {
          $scope.page = $templateCache.get('pageTemplate');
        }

        Core.$apply($scope);
      };

      $scope.$watch('mbeans', (newValue, oldValue) => {
        log.debug("Mbeans: ", $scope.mbeans);

        Core.unregister(jolokia, $scope);
        $scope.mbeans.forEach((mbean) => {
          Core.register(jolokia, $scope, {
            type: 'exec', mbean: mbean,
            operation: "healthList()"
          }, {
            success: $scope.render,
            error: (response) => {
              log.error("Failed to invoke healthList() on mbean: " + mbean + " due to: ", response.error);
              log.info("Stack trace: ", response.stacktrace.split("\n"));
            }
          });
        });
      }, true);

      $scope.getMBeans = () => {
        var healthMap = getHealthMBeans(workspace);
        log.debug("HealthMap: ", healthMap);
        if (healthMap) {
          if (!angular.isArray(healthMap)) {
            return [healthMap.objectName];
          }
          var answer = healthMap.map((obj) => { return obj.objectName; });
          return answer;
        } else {
          return [];
        }
      };

      $scope.getTitle = (value) => {
        if (value['healthId'].endsWith('profileHealth')) {
          return 'Profile: ' + value['profile'];
        }
        return 'HealthID: ' + value['healthId'];
      };

      $scope.mbeans = $scope.getMBeans();

      $scope.$on("$routeChangeSuccess", function (event, current, previous) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //setTimeout(updateTableContents, 50);
      });

      $scope.$watch('workspace.selection', function () {
        //if (workspace.moveIfViewInvalid()) return;
        //updateTableContents();
      });

      function updateTableContents() {
        var objects = getHealthMBeans(workspace);
        if (objects) {
          var jolokia = workspace.jolokia;
          $scope.firstResult = true;
          if (angular.isArray(objects)) {
            var args = [];
            var onSuccessArray = [];

            function callback(response, object) {
              if ($scope.firstResult) {
                $scope.results = [];
                $scope.firstResult = false;
              }
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
              console.log("$scope.results: ", $scope.results);
              $scope.widget.populateTable(defaultValues($scope.results));
              Core.$apply($scope);
            };
            jolokia.request(args, onSuccess(onSuccessArray));
          } else {
            function populateTable(response) {
              var values = response.value;
              if (!values || values.length === 0) {
                values = [createOKStatus(objects)];
              }
              var data = defaultValues(values);
              $scope.widget.populateTable(data);
              Core.$apply($scope);
            }
            jolokia.request(
                    asHealthQuery(objects),
                    onSuccess(populateTable));
          }
        }
      }

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


      function asHealthQuery(meanInfo: any) {
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

    }


}
