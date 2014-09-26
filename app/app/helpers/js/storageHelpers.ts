/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="./controllerHelpers.ts"/>
module StorageHelpers {

  export interface BindModelToLocalStorageOptions {
    $scope:any;
    $location:ng.ILocationService;
    localStorage:WindowLocalStorage;
    modelName:string;
    paramName:string;
    initialValue?:any;
    to?: (value:any) => any;
    from?: (value:any) => any;
    onChange?: (value:any) => void;
  }

  export function bindModelToLocalStorage(options:BindModelToLocalStorageOptions) {

    var prefix = options.$scope.name + ':' || '::';
    var storageKey = prefix + options.modelName;

    var toParam = options.to || Core.doNothing
    var fromParam = options.from || Core.doNothing;

    var toWrapper = (value:any):any => {
      if (angular.isFunction(options.onChange)) {
        options.onChange(value);
      }
      var answer = toParam(value);
      options.localStorage[storageKey] = answer;
      return answer;
    };

    var fromWrapper = (value:any):any => {
      if (value === undefined || value === null) {
        value = options.localStorage[storageKey];
      }
      return fromParam(value);
    };

    ControllerHelpers.bindModelToSearchParam(options.$scope, options.$location, options.modelName, options.paramName, options.initialValue, toWrapper, fromWrapper);

  }

}
