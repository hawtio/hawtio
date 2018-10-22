/// <reference path="./login.component.ts"/>
/// <reference path="./login.config.ts"/>

namespace Login {

  export const loginModule = angular
    .module('hawtio-login', [])
    .component('hawtioLogin', loginComponent)
    .run(init)
    .name;

  export const log = Logger.get(loginModule);

}
