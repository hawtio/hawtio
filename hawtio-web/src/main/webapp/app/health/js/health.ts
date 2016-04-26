/**
 * @module Health
 */
/// <reference path="healthPlugin.ts"/>
module Health {

    export var HealthController = _module.controller("Health.HealthController", ["$scope", "jolokia", "workspace", "$templateCache", ($scope, jolokia, workspace:Workspace, $templateCache) => {

      Health.decorate($scope);

      $scope.results = [];
      $scope.responses = {};
      $scope.mbeans = [];
      $scope.mbeanStatus = {};
      $scope.displays = [];
      $scope.page = '';

      $scope.pageFilter = '';

      $scope.$watch('mbeans', (newValue, oldValue) => {
        Core.unregister(jolokia, $scope);
        if (!newValue) {
          return;
        }
        $scope.mbeanStatus = {};
        newValue.forEach((mbean) => {
          var unregFunc = Core.register(jolokia, $scope, {
            type: 'exec', mbean: mbean,
            operation: "healthList()"
          }, {
            success: $scope.render,
            error: (response) => {
              log.info("Failed to invoke healthList() on mbean: " + mbean + " due to: ", response.error);
              log.debug("Stack trace: ", response.stacktrace.split("\n"));
              unregFunc();
            }
          });

          var error = (response) => {
            if (!response.error.has("AttributeNotFoundException")) {
              log.info("Failed to read CurrentStatus on mbean: " + mbean + " due to: ", response.error);
              log.debug("Stack trace: ", response.stacktrace.split("\n"));
            }
          };

          //see if the mbean has a CurrentStatus attribute and keep an eye on it if so
          jolokia.request({
            type: 'read', mbean: mbean, attribute: 'CurrentStatus'
          }, {
            success: (response) => {
              $scope.mbeanStatus[response.request['mbean']] = response.value;
              Core.register(jolokia, $scope, {
                type: 'read', mbean: mbean, attribute: 'CurrentStatus'
              }, {
                success: (response) => {
                  /*
                  log.debug("response for CurrentStatus",
                      response.request['mbean'],
                      ": ",
                      response.value);
                      */
                  if (response.value === $scope.mbeanStatus[response.request['mbean']]) {
                    return;
                  }
                  $scope.mbeanStatus[response.request['mbean']] = response.value;
                  Core.$apply($scope);
                },
                error: error
              });
            },
            error: error
          });
        });
      }, true);


      $scope.getTitleClass = (display) => {
        if (!display) {
          return "warning";
        }
        if (!display.values || display.values.length === 0) {
          return "ok";
        }
        var answer:string = "ok";
        display.values.forEach((value) => {
          if (answer !== "warning" && value.level && value.level.toLowerCase() !== 'info') {
            answer = "warning";
          }
        });

        return answer;
      };


      $scope.getHumanName = (name) => {
        var answer = name;

        if (name.startsWith("org.apache.activemq")) {
          var nameParts = name.split(',');
          nameParts.forEach((part) => {
            if (part.startsWith('brokerName')) {
              var parts = part.split('=');
              if (parts[1]) {
                answer = "Broker: " + parts[1];
              }
            }
          });
          return answer;
        }

        if (name.startsWith("io.fabric8:service")) {
          return "Fabric8";
        }

        // see if there is a desc attribute then use that as description
        var nameParts = name.split(',');
        nameParts.forEach((part) => {
          if (part.startsWith('desc')) {
            var parts = part.split('=');
            if (parts[1]) {
              answer = parts[1];
            }
          }
        });

        return answer;
      };

      $scope.getMBeans = () => {
        var healthMap:any = getHealthMBeans(workspace);
        log.debug("HealthMap: ", healthMap);
        if (healthMap) {
          if (!angular.isArray(healthMap)) {
            return [healthMap.objectName];
          }
          var answer = healthMap.map((obj) => { return obj.objectName; });
          log.debug("Health mbeans: ", answer);
          return answer;
        } else {
          log.debug("No health mbeans found...");
          return [];
        }
      };

      $scope.$on('jmxTreeUpdated', () => {
        $scope.mbeans = $scope.getMBeans();
      });

      $scope.$on('$routeChangeSuccess', () => {
        $scope.mbeans = $scope.getMBeans();
      });

      $scope.mbeans = $scope.getMBeans();

      $scope.render = (response) => {
        /*
         log.debug("response for ",
            response.request['mbean'],
            ".",
            response.request['operation'],
            ": ",
            response.value);
        */
        var mbean = response.request['mbean'];
        var values = response.value;

        // some services will only return responses for negative events.  In that case
        // create an ok status, otherwise we get no diagram.
        if (values !== null && values.length == 0) {
          var name = $scope.getHumanName(mbean);
          var domain = name;
          if (mbean.startsWith("org.apache.activemq")) {
            domain = Health.healthDomains["org.apache.activemq"];
          }

          var okStatus = createOKStatus({domain:domain, title:name});
          values = [okStatus];
        }

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

        values.forEach($scope.generateChartData);

        if (!display) {
          $scope.displays.push({
            mbean: mbean,
            values: values
          });
        } else {
          display.values = values;
        }

        //log.debug("Display: ", $scope.displays);
        if ($scope.page === '') {
          $scope.page = $templateCache.get('pageTemplate');
        }

        Core.$apply($scope);
      };


      $scope.filterValues = (value) => {
        var json = angular.toJson(value);
        return Core.matchFilterIgnoreCase(json, $scope.pageFilter);
      };


      $scope.isPercentage = (key) => {
        if( key !== undefined && key.toUpperCase().indexOf("PERCENT") > 0 ){
           return true;
        }
        return false;
      };

      /*
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
                  kind = Core.humanizeValue(id.substring(idx + 1));
                  aData["kind"] = kind;
                }
              }
            }
            aData["domain"] = domain;
          }
        });
        return values;
      }

      function createOKStatus(object) {
        return {
          healthId: object.domain,
          level: "INFO",
          message: object.title + " is OK",
          instances: 1,
          healthPercent: 1
        };
      }
    }]);
}
