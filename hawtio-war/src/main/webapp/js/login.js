var login = angular.module('login', []);

login.controller('LoginController', ['$http', '$window',
  function ($http, $window) {
    var ctrl = this;

    ctrl.branding = {};
    ctrl.entity = {
      username: '',
      password: ''
    };
    ctrl.wrongPassword = false;

    // fetch hawtconfig.json
    $http.get('hawtconfig.json')
      .then(function (response) {
        console.debug('hawtconfig.json:', response.data);
        ctrl.branding = response.data.branding;
      },
      function (response) {
        console.warn('Failed to fetch hawtconfig.json', response);
      });

    ctrl.doLogin = function () {
      var url = 'auth/login';
      if (ctrl.entity.username.trim() == '') {
        return;
      }
      $http.post(url, ctrl.entity).then(
        function (response) {
          console.debug("login success:", response.data);
          $window.location.href = '/hawtio/';
        },
        function (response) {
          console.error('Failed to log in', response);
          ctrl.wrongPassword = true;
        });
    };
  }]);
