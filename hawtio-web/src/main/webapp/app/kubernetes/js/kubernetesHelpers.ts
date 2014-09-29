/// <reference path="../../baseIncludes.ts"/>
module Kubernetes {

  export interface KubePod {
    id:string;
  }

  export function setJson($scope, id, collection) {
    $scope.id = id;
    if (!$scope.fetched) {
      return;
    }
    if (!id) {
      $scope.json = '';
      return;
    }
    var item = collection.find((item) => { return item.id === id; });
    if (!item) {
      $scope.id = undefined;
      $scope.json = '';
    } else {
      $scope.json = angular.toJson(item, true);
    }
  }


  /**
   * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
   */
  export function labelsToString(labels) {
    var answer = "";
    angular.forEach(labels, (value, key) => {
      var separator = answer ? "," : "";
      answer += separator + key + "=" + value;
    });
    return answer;
  }


  /**
   * Recursively compares all string fields in the object tree for the given text
   */
  function textMatches(entity, text: string, entitiesSearched) {
    if (angular.isString(entity)) {
      return entity.indexOf(text) >= 0;
    } else if (angular.isArray(entity) || angular.isObject(entity)) {
      var answer = false;
      angular.forEach(entity, value => {
        if (!answer && entitiesSearched.indexOf(value) < 0) {
          entitiesSearched.push(value);
          if (textMatches(value, text, entitiesSearched)) {
            answer = true;
          }
        }
      });
      return answer;
    } else {
      return false;
    }
  }

  /**
   * Re-evaluates the given filter on the list of entities
   */
  export function filterEntities(entities, filter) {
    var filterText = filter.text;
    if (!filterText) {
      filter.entities = entities;
    } else {
      var expressions = filterText.split(/\s+/);
      filter.entities = entities.filter(entity => {
        var answer = true;
        angular.forEach(expressions, (expression) => {
          if (answer && !textMatches(entity, expression, [entity])) {
            answer = false;
          }
        });
        return answer;
      });
    }
  }
}
