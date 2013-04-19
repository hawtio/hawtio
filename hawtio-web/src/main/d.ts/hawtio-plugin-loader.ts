module Hawtio {

  export interface PluginLoaderStatic {

    parseQueryString():any;
    parseQueryString(text: string):any;
    getCredentials(text: string):any;

    addModule(module:String);
    addUrl(url:String);

    getModules():String[];

    loadPlugins(callback: () => void);
    debug();

  }

}

declare var hawtioPluginLoader: Hawtio.PluginLoaderStatic;
