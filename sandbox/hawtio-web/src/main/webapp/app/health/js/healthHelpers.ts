/**
 * @module Health
 */
/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module Health {

  export var log:Logging.Logger = Logger.get("Health");

  export var healthDomains = {
    "org.apache.activemq": "ActiveMQ",
    "org.apache.camel": "Camel",
    "io.fabric8": "Fabric8"
  };

  export function hasHealthMBeans(workspace:Workspace) {
    var beans = getHealthMBeans(workspace);
    if (beans) {
      if (angular.isArray(beans)) return beans.length >= 1;
      return true;
    }
    return false;
  }

  /**
   * Returns the health MBeans
   * @method getHealthMBeans
   * @for Health
   * @param {Workspace} workspace
   * @return {String}
   */
  export function getHealthMBeans(workspace:Workspace):any {
    if (workspace) {
      var healthMap = workspace.mbeanServicesToDomain["Health"] || {};
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

  export interface LevelSortingMap {
    [name:string]:number;
  }

  export interface ColorMap {
    Health: string;
    Remaining: string;
  }

  export interface ColorMaps {
    [name:string]:ColorMap;
  }

  export interface HealthMixins extends ng.IScope {
    levelSorting: Health.LevelSortingMap;
    colorMaps: Health.ColorMaps;
    showKey: (key:string) => boolean;
    sanitize: (value:any) => any;
    getTitle: (value:any) => string;
    generateChartData: (value:any) => void;
  }

  export function decorate($scope:HealthMixins) {

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

    $scope.showKey = (key) => {
      if ( key === "colorMap" || key === "data") {
        return false;
      }
      return true;
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

    $scope.getTitle = (value) => {
      if (!value) {
        return '';
      }
      if (value['healthId'].endsWith('profileHealth')) {
        return 'Profile: <strong>' + value['profile'] + '</strong>';
      }
      return 'HealthID: <strong>' + value['healthId'] + '</strong>';
    };

    $scope.generateChartData = (value:any) => {

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
    };



  }
}
