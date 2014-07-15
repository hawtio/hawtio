/// <reference path="../../baseHelpers.ts"/>
module SelectionHelpers {

  var log:Logging.Logger = Logger.get("SelectionHelpers");

  // these functions deal with adding/using a 'selected' item on a group of objects
  export function selectNone(group:any[]):void {
    group.forEach((item:any):void => { item['selected'] = false; });
  }

  export function selectAll(group:any[], filter?:(any) => boolean):void {
    group.forEach((item:any):void => {
      if (!filter) {
        item['selected'] = true;
      } else {
        if (filter(item)) {
          item['selected'] = true;
        }
      }
    });
  }

  export function toggleSelection(item:any):void {
    item['selected'] = !item['selected'];
  }

  export function selectOne(group:any[], item:any):void {
    selectNone(group);
    toggleSelection(item);
  }

  export function sync(selections:Array<any>, group:Array<any>, index:string):Array<any> {
    group.forEach((item) => {
      item['selected'] = selections.any((selection) => {
        return selection[index] === item[index];
      })
    });
    return group.filter((item) => { return item['selected'] });
  }

  export function select(group:any[], item:any, $event:any):void {
    var ctrlKey = $event.ctrlKey;
    if (!ctrlKey) {
      if (item['selected']) {
        toggleSelection(item);
      } else {
        selectOne(group, item);
      }
    } else {
      toggleSelection(item);
    }
  }

  export function isSelected(item:any, yes:string, no:string):any {
    return maybe(item['selected'], yes, no);
  }

  // these functions deal with using a separate selection array
  export function clearGroup(group:any):void {
    group.length = 0;
  }

  export function toggleSelectionFromGroup(group:any[], item:any, search?:(item:any) => boolean):void {
    var searchMethod = search || item;
    if (group.any(searchMethod)) {
      group.remove(searchMethod);
    } else {
      group.add(item);
    }
  }

  function stringOrBoolean(str:string, bool:boolean):any {
    if (angular.isDefined(str)) {
      return str;
    } else {
      return bool;
    }
  }

  function nope(str?:string) {
    return stringOrBoolean(str, false);
  }

  function yup(str?:string) {
    return stringOrBoolean(str, true);
  }

  function maybe(bool:boolean, yes?:string, no?:string) {
    if (bool) {
      return yup(yes);
    } else {
      return nope(no);
    }
  }

  export function isInGroup(group:any[], item:any, yes?:string, no?:string, search?:(item:any) => boolean):any {
    if (!group) {
      return nope(no);
    }
    var searchMethod = search || item;
    return maybe(group.any(searchMethod), yes, no);
  }

  export function filterByGroup(group:any, item:any, yes?:string, no?:string, search?:(item:any) => boolean):any {
    if (group.length === 0) {
      return yup(yes);
    }
    var searchMethod = search || item;
    if (angular.isArray(item)) {
      return maybe(group.intersect(item).length === group.length, yes, no);
    } else {
      return maybe(group.any(searchMethod), yes, no);
    }
  }

  export function syncGroupSelection(group:any, collection:any, attribute?:string) {
    var newGroup = [];
    if (attribute) {
      group.forEach((groupItem) => {
        var first = collection.find((collectionItem) => {
          return groupItem[attribute] === collectionItem[attribute];
        });
        if (first) {
          newGroup.push(first);
        }
      });
    } else {
      group.forEach((groupItem) => {
        var first = collection.find((collectionItem) => {
          return Object.equal(groupItem, collectionItem);
        });
        if (first) {
          newGroup.push(first);
        }
      });
    }
    clearGroup(group);
    group.add(newGroup);
  }

  export function decorate($scope) {
    $scope.selectNone = selectNone;
    $scope.selectAll = selectAll;
    $scope.toggleSelection = toggleSelection;
    $scope.selectOne = selectOne;
    $scope.select = select;
    $scope.clearGroup = clearGroup;
    $scope.toggleSelectionFromGroup = toggleSelectionFromGroup;
    $scope.isInGroup = isInGroup;
    $scope.filterByGroup = filterByGroup;
  }


}

