namespace Login {

  const LOGIN_URL: string = 'auth/login';

  export class LoginController {
    branding = {};
    entity = {
      username: '',
      password: ''
    };
    wrongPassword: boolean = false;

    constructor(
      private $http: ng.IHttpService,
      private $window: ng.IWindowService,
      private documentBase: string) {
      'ngInject';
    }

    $onInit(): void {
      // fetch hawtconfig.json
      this.$http.get('hawtconfig.json').then(
        (response: ng.IHttpResponse<Core.Config>) => {
          log.debug('hawtconfig.json:', response.data);
          this.branding = response.data.branding;
        },
        (response) => {
          log.warn('Failed to fetch hawtconfig.json', response);
        });
    }

    doLogin(): void {
      if (this.entity.username.trim() == '') {
        return;
      }
      this.$http.post(LOGIN_URL, this.entity).then(
        (response: ng.IHttpResponse<any>) => {
          log.debug("Server login success:", response.data);
          this.$window.location.href = this.documentBase;
        },
        (response) => {
          log.error('Failed to log in', response);
          this.wrongPassword = true;
        });
    }
  }

  export const loginComponent: angular.IComponentOptions = {
    controller: LoginController,
    templateUrl: 'app/src/login/login.component.html'
  };
}
