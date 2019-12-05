namespace Login {

  const LOGIN_URL: string = 'auth/login';

  export class LoginController {
    branding: Core.Branding = {};
    login: Core.Login = {};
    entity = {
      username: '',
      password: ''
    };
    wrongPassword: boolean = false;

    constructor(
      private configManager: Core.ConfigManager,
      private $http: ng.IHttpService,
      private $window: ng.IWindowService,
      private documentBase: string) {
      'ngInject';
    }

    $onInit(): void {
      this.branding = this.configManager.branding;
      this.login = this.configManager.login;
    }

    doLogin(): void {
      if (this.entity.username.trim() === '') {
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
