/**
 * @module Core
 */
 module Core {

  export class PreferencesRegistry {

    private tabs:any = {};

    constructor() {

    }

    public addTab(name:string, template:string, isValid: () => boolean = undefined) {
      if (!isValid) {
        isValid = () => { return true; };
      }
      this.tabs[name] = {
        template: template,
        isValid: isValid
      };
    }

    public getTab(name:string) {
      return this.tabs[name];
    }

    public getTabs():any {
      var answer = {};
      angular.forEach(this.tabs, (value, key) => {
        if (value.isValid()) {
          answer[key] = value;
        }
      });
      return answer;
    }
  };
}

