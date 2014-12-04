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
            var targetGroup = item[group];
            if (targetGroup.length !== currentGroup.length) {
              createGroup = true;
            } else {
              createGroup = false;
              targetGroup.forEach((item) => {
                if (!createGroup && !currentGroup.any((i) => { return i === item; })) {
                  createGroup = true;
                }
              });
            }
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
