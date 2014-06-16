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

      var currentGroup = list.first()[group];
      list.first()[newGroup] = true;
      
      list.forEach((item) => {
        if (item[group] !== currentGroup) {
          item[newGroup] = true;
          currentGroup = item[group];
        }
      });

      return list;
    };
  }

  _module.filter('hawtioGroupBy', UI.groupBy);
}
