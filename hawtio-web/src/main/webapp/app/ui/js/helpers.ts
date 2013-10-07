module UI {

  export var scrollBarWidth:number = null;

  /*
   * Helper function to ensure a directive attribute has some default value
   */
  export function observe($scope, $attrs, key, defValue, callbackFunc = null) {
    $attrs.$observe(key, function(value) {
      if (!angular.isDefined(value)) {
        $scope[key] = defValue;
      } else {
        $scope[key] = value;
      }
      if (angular.isDefined(callbackFunc) && callbackFunc) {
        callbackFunc($scope[key])
      }
    });
  }

  export function getScrollbarWidth() {
    if (!angular.isDefined(UI.scrollBarWidth)) {
      var div:any = document.createElement('div');
      div.innerHTML = '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;"><div style="width:1px;height:100px;"></div></div>';
      div = div.firstChild;
      document.body.appendChild(div);
      UI.scrollBarWidth = div.offsetWidth - div.clientWidth;
      document.body.removeChild(div);
    }
    return UI.scrollBarWidth;

  }

}
