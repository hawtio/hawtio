/**
 * @module Health
 */
module Health {

    export function HealthController($scope, jolokia, workspace:Workspace, $templateCache) {

      $scope.levelSorting = {
        'ERROR': 0,
        'WARNING': 1,
        'INFO': 2
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
      };

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
        var answer = "ok";
        display.values.forEach((value) => {
          if (answer !== "warning" && value.level && value.level.toLowerCase() !== 'info') {
            answer = "warning";
          }
        });

        return answer;
      };


      $scope.getHumanName = (name) => {
        if (name.startsWith("org.apache.activemq")) {
          var answer = name;
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

        return name;

      };


      $scope.getMBeans = () => {
        var healthMap = getHealthMBeans(workspace);
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

          var healthPercentCurrent = 0;
          var healthPercentRemaining = 1;

          if ('healthPercent' in value) {
            var healthPercent = <number>value['healthPercent'];
            healthPercentCurrent = healthPercent.round(3);
            healthPercentRemaining = 1 - healthPercentCurrent;
            healthPercentRemaining = healthPercentRemaining.round(3);
          }

          value.data = {
              total: 1,
              terms: [{
                term: 'Health',
                count: healthPercentCurrent
              }, {
                term: 'Remaining',
                count: healthPercentRemaining
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

        //log.debug("Display: ", $scope.displays);
        if ($scope.page === '') {
          $scope.page = $templateCache.get('pageTemplate');
        }

        Core.$apply($scope);
      };


      $scope.filterValues = (value) => {
        var json = angular.toJson(value);
        return json.has($scope.pageFilter);
      };


      $scope.sanitize = (value) => {
        var answer = {};
        Object.extended(value).keys().forEach((key) => {
          if ($scope.showKey(key) && value[key]) {
            answer[key] = value[key];
          }
        });
        return answer;
      };


      $scope.showKey = (key) => {
        if ( key === "colorMap" || key === "data") {
          return false;
        }
        return true;
      };

      $scope.getTitle = (value) => {
        if (value['healthId'].endsWith('profileHealth')) {
          return 'Profile: <strong>' + value['profile'] + '</strong>';
        }
        return 'HealthID: <strong>' + value['healthId'] + '</strong>';
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

      function createOKStatus(object) {
        return {
          healthId: object.domain + ".status",
          level: "INFO",
          message: object.title + " is OK"
        };
      }

    }


}
