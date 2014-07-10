/// <reference path="./uiPlugin.ts"/>
module UI {

  export function groupBy() {
    return (list, group) => {

      if (list.length === 0) {
        return list;
      }

      if (Core.isBlank(group)) {
        return list;
      }

      var newGroup = 'newGroup';
      var endGroup = 'endGroup';
      var currentGroup:any = undefined;

      function createNewGroup(list, item, index) {
        item[newGroup] = true;
        item[endGroup] = false;
        currentGroup = item[group];
        if (index > 0) {
          list[index - 1][endGroup] = true;
        }
      }

      function addItemToExistingGroup(item) {
        item[newGroup] = false;
        item[endGroup] = false;
      }
      
      list.forEach((item, index) => {
        var createGroup = item[group] !== currentGroup;
        if (angular.isArray(item[group])) {
          if (currentGroup === undefined) {
            createGroup = true; 
          } else {
            var intersection = item[group].intersect(currentGroup);
            createGroup = intersection.length !== currentGroup.length;
          }
        }
        if (createGroup) {
          createNewGroup(list, item, index);
        } else {
          addItemToExistingGroup(item);
        }
      });

      return list;
    };
  }

  _module.filter('hawtioGroupBy', UI.groupBy);

}
