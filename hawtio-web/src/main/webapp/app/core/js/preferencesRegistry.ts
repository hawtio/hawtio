/**
 * @module Core
 */
 module Core {

  export class PreferencesRegistry {

    private tabs:any = {};

    constructor() {

    }

    public addTab(name:string, template:string) {
      this.tabs[name] = template;
    }

    public getTab(name:string) {
      return this.tabs[name];
    }

    public getTabs():any {
      return this.tabs;
    }
  }
}

