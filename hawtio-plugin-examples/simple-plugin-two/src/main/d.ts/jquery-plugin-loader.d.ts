interface PluginLoader {
  loadPlugins(callback: () => void);
  addModule(module:String);
  getModules(): string[];
};

interface JQueryStatic {
  plugin_loader:PluginLoader;
}
