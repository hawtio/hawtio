module UI {

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




}
