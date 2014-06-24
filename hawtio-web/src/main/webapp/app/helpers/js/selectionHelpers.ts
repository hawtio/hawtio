
module SelectionHelpers {

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

  export function select(group:any[], item:any, $event:any):void {
    var ctrlKey = $event.ctrlKey;
    if (!ctrlKey) {
      if (item.selected) {
        toggleSelection(item);
      } else {
        selectOne(group, item);
      }
    } else {
      toggleSelection(item);
    }
  }

  export function decorate($scope) {
    $scope.selectNone = selectNone;
    $scope.selectAll = selectAll;
    $scope.toggleSelection = toggleSelection;
    $scope.selectOne = selectOne;
    $scope.select = select;
  }
}

