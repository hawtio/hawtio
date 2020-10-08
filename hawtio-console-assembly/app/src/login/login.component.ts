namespace Login {

  const LOGIN_URL: string = 'auth/login';

  const LOCAL_STORAGE_KEY_LOGIN: string = 'login';

  export class LoginController {
    branding: Core.Branding = { appName: '', appLogoUrl: '' };
    login: Core.Login = {};
    entity = { username: '', password: '' };
    wrongPassword: boolean = false;
    rememberMe: boolean = false;

    constructor(
      private configManager: Core.ConfigManager,
      private $http: ng.IHttpService,
      private $window: ng.IWindowService,
      private localStorage: Storage,
      private documentBase: string) {
      'ngInject';

      if (LOCAL_STORAGE_KEY_LOGIN in localStorage) {
        const login = angular.fromJson(localStorage[LOCAL_STORAGE_KEY_LOGIN]);
        if (login.username) {
          this.entity.username = login.username;
          this.rememberMe = true;
        }
      }
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
          if (this.rememberMe) {
            this.localStorage[LOCAL_STORAGE_KEY_LOGIN] = angular.toJson({ username: this.entity.username });
          } else {
            delete this.localStorage[LOCAL_STORAGE_KEY_LOGIN];
          }
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
