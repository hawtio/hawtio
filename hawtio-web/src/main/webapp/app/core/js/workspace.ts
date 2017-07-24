/**
 * @module Core
 */

/// <reference path="corePlugin.ts"/>
/// <reference path="jolokiaInterfaces.ts"/>
/// <reference path="folder.ts"/>
/// <reference path="../../jmx/js/jmxHelpers.ts"/>
module Core {

  /**
   * @class NavMenuItem
   */
  export interface NavMenuItem {
    id: string;
    content: string;
    title?: string;
    isValid?: (workspace:Core.Workspace, perspectiveId?:string) => any;
    isActive?: (worksace:Core.Workspace) => boolean;
    href: () => any;
  }


  var log:Logging.Logger = Logger.get("Core");
  /**
   * @class Workspace
   */
  export class Workspace {
    public operationCounter = 0;
    public selection:NodeSelection;
    public tree:Folder = new Folder('MBeans');
    public mbeanTypesToDomain = {};
    public mbeanServicesToDomain = {};
    public attributeColumnDefs = {};
    public onClickRowHandlers = {};
    public treePostProcessors = [];
    public topLevelTabs = <Array<NavMenuItem>>[];
    public subLevelTabs = [];
    public keyToNodeMap = {};
    public pluginRegisterHandle = null;
    public pluginUpdateCounter = null;
    public treeWatchRegisterHandle = null;
    public treeWatcherCounter = null;
    public treeElement = null;
    // mapData allows to store arbitrary data on the workspace
    public mapData = {};

    constructor(public jolokia,
                public jolokiaStatus,
                public jmxTreeLazyLoadRegistry,
                public $location,
                public $compile:ng.ICompileService,
                public $templateCache:ng.ITemplateCacheService,
                public localStorage:WindowLocalStorage,
                public $rootScope,
                public userDetails) {

      // set defaults
      if (!('autoRefresh' in localStorage)) {
        localStorage['autoRefresh'] = true;
      }
      if (!('updateRate' in localStorage)) {
        localStorage['updateRate'] = 5000;
      }
    }

    /**
     * Creates a shallow copy child workspace with its own selection and location
     * @method createChildWorkspace
     * @param {ng.ILocationService} location
     * @return {Workspace}
     */
    public createChildWorkspace(location): Workspace {
      var child = new Workspace(this.jolokia, this.jolokiaStatus, this.jmxTreeLazyLoadRegistry,
              this.$location, this.$compile, this.$templateCache, this.localStorage, this.$rootScope, this.userDetails);
      // lets copy across all the properties just in case
      angular.forEach(this, (value, key) => child[key] = value);
      child.$location = location;
      return child;
    }

    getLocalStorage(key:string) {
      return this.localStorage[key];
    }

    setLocalStorage(key:string, value:any) {
      this.localStorage[key] = value;
    }

    public jolokiaList(cb, flags):any {
      if (this.jolokiaStatus.listMethod != LIST_WITH_RBAC) {
        return this.jolokia.list(null, onSuccess(cb, flags));
      } else {
        flags.maxDepth = 9;
        var res = this.jolokia.execute(this.jolokiaStatus.listMBean, "list()", onSuccess(cb, flags));
        if (res) {
          return this.unwindResponseWithRBACCache(res);
        }
      }
    }

    public loadTree() {
      // Make an initial blocking call to ensure the JMX tree is populated while the
      // app is initializing...
      var flags = {ignoreErrors: true};
      var data = this.jolokiaList(null, flags);

      if (data) {
        this.jolokiaStatus.xhr = null;
      }
      this.populateTree({
        value: data
      });
    }

    /**
     * Adds a post processor of the tree to swizzle the tree metadata after loading
     * such as correcting any typeName values or CSS styles by hand
     * @method addTreePostProcessor
     * @param {Function} processor
     * @param {number} priority - lower number == higher priority. default: 0
     * @param {string} name - name of the processor (to allow for removal)
     */
    public addTreePostProcessor(processor:(tree:any) => void, priority:number = 0, name:string = "unnamed") {
      var postProcessor:any = {
        processor: processor,
        priority: priority,
        name: name
      };
      this.treePostProcessors.push(postProcessor);

      var tree = this.tree;
      if (tree) {
        // the tree is loaded already so lets process it now :)
        processor(tree);
      }
    }

    public removeTreePostProcessors(name:string) {
      this.treePostProcessors.remove((el) => {
        return el.name == name;
      });
    }

    public maybeMonitorPlugins() {
      if (this.treeContainsDomainAndProperties("hawtio", {type: "Registry"})) {
        if (this.pluginRegisterHandle === null) {
          this.pluginRegisterHandle = this.jolokia.register(angular.bind(this, this.maybeUpdatePlugins), {
            type: "read",
            mbean: "hawtio:type=Registry",
            attribute: "UpdateCounter"
          });
        }
      } else {
        if (this.pluginRegisterHandle !== null) {
          this.jolokia.unregister(this.pluginRegisterHandle);
          this.pluginRegisterHandle = null;
          this.pluginUpdateCounter = null;
        }
      }

      // lets also listen to see if we have a JMX tree watcher
      if (this.treeContainsDomainAndProperties("hawtio", {type: "TreeWatcher"})) {
        if (this.treeWatchRegisterHandle === null) {
          this.treeWatchRegisterHandle = this.jolokia.register(angular.bind(this, this.maybeReloadTree), {
            type: "read",
            mbean: "hawtio:type=TreeWatcher",
            attribute: "Counter"
          });
        }
      }
    }

    public maybeUpdatePlugins(response) {
      if (this.pluginUpdateCounter === null) {
        this.pluginUpdateCounter = response.value;
        return;
      }
      if (this.pluginUpdateCounter !== response.value) {
        if (Core.parseBooleanValue(localStorage['autoRefresh'])) {
          window.location.reload();
        }
      }
    }

    public maybeReloadTree(response) {
      var counter = response.value;
      if (this.treeWatcherCounter === null) {
        this.treeWatcherCounter = counter;
        return;
      }
      if (this.treeWatcherCounter !== counter) {
        this.treeWatcherCounter = counter;
        var workspace = this;
        function wrapInValue(response) {
          var wrapper = {
            value: workspace.unwindResponseWithRBACCache(response)
          };
          workspace.populateTree(wrapper);
        }
        this.jolokiaList(wrapInValue, {ignoreErrors: true, maxDepth: 8});
      }
    }

    /**
     * Processes response from jolokia list - if it contains "domains" and "cache" properties
     * @param res
     */
    public unwindResponseWithRBACCache(res) {
      if (res['domains'] && res['cache']) {
        // post process cached RBAC info
        for (var domainName in res['domains']) {
          var domainClass = escapeDots(domainName);
          var domain = <Core.JMXDomain> res['domains'][domainName];
          for (var mbeanName in domain) {
            if (angular.isString(domain[mbeanName])) {
              domain[mbeanName] = <Core.JMXMBean>res['cache']["" + domain[mbeanName]];
            }
          }
        }
        return res['domains'];
      }
      return res;
    }

    public folderGetOrElse(folder, value) {
      if (folder) {
        try {
          return folder.getOrElse(value);
        } catch (e) {
          log.warn("Failed to find value " + value + " on folder " + folder);
        }
      }
      return null;
    }

    public populateTree(response) {
      log.debug("JMX tree has been loaded, data: ", response.value);

      var rootId = 'root';
      var separator = '-';
      this.mbeanTypesToDomain = {};
      this.mbeanServicesToDomain = {};
      this.keyToNodeMap = {};
      var tree = new Folder('MBeans');
      tree.key = rootId;
      var domains = <Core.JMXDomains> response.value;
      for (var domainName in domains) {
        var domainClass = escapeDots(domainName);
        var domain = <Core.JMXDomain> domains[domainName];
        // domain name is displayed in the tree, so let's escape it here
        // Core.escapeHtml() and _.escape() cannot be used, as escaping '"' breaks Camel tree...
        domainName = Jmx.escapeTagOnly(domainName);
        for (var mbeanName in domain) {
          log.debug("JMX tree mbean name: " + mbeanName);
          var entries = {};
          var folder = this.folderGetOrElse(tree, domainName);
          //if (!folder) continue;
          folder.domain = domainName;
          if (!folder.key) {
            folder.key = rootId + separator + domainName;
          }
          var folderNames = [domainName];
          folder.folderNames = folderNames;
          folderNames = folderNames.clone();
          var items = mbeanName.split(',');
          var paths = [];
          var typeName = null;
          var serviceName = null;
          items.forEach(item => {
            // do not use split('=') as it splits wrong when there is a space in the mbean name
            // var kv = item.split('=');
            var pos = item.indexOf('=');
            var kv = [];
            if (pos > 0) {
              kv[0] = item.substr(0, pos);
              kv[1] = item.substr(pos + 1);
            } else {
              kv[0] = item;
            }
            var key = kv[0];
            // mbean property value is displayed in the tree, so let's escape it here
            // Core.escapeHtml() and _.escape() cannot be used, as escaping '"' breaks Camel tree...
            var value = Jmx.escapeTagOnly(kv[1] || key);
            entries[key] = value;
            var moveToFront = false;
            var lowerKey = key.toLowerCase();
            if (lowerKey === "type") {
              typeName = value;
              // if the type name value already exists in the root node
              // of the domain then lets move this property around too
              if (folder.map[value]) {
                moveToFront = true;
              }
            }
            if (lowerKey === "service") {
              serviceName = value;
            }
            if (moveToFront) {
              paths.splice(0, 0, value);
            } else {
              paths.push(value);
            }
          });


          var configureFolder = function(folder: Folder, name: string) {
            folder.domain = domainName;
            if (!folder.key) {
              folder.key = rootId + separator + folderNames.join(separator);
            }
            this.keyToNodeMap[folder.key] = folder;
            folder.folderNames = folderNames.clone();
            //var classes = escapeDots(folder.key);
            var classes = "";
            var entries = folder.entries;
            var entryKeys = Object.keys(entries).filter((n) => n.toLowerCase().indexOf("type") >= 0);
            if (entryKeys.length) {
              angular.forEach(entryKeys, (entryKey) => {
                var entryValue = entries[entryKey];
                if (!folder.ancestorHasEntry(entryKey, entryValue)) {
                  classes += " " + domainClass + separator + entryValue;
                }
              });
            } else {
              var kindName = folderNames.last();
              /*if (folder.parent && folder.parent.title === typeName) {
                 kindName = typeName;
                 } else */
                if (kindName === name) {
                  kindName += "-folder";
                }
                if (kindName) {
                  classes += " " + domainClass + separator + kindName;
                }
            }
            folder.addClass = escapeTreeCssStyles(classes);
            return folder;
          };

          var lastPath = paths.pop();
          var ws = this;
          paths.forEach((value) => {
            folder = ws.folderGetOrElse(folder, value);
            if (folder) {
              folderNames.push(value);
              angular.bind(ws, configureFolder, folder, value)();
            }
          });
          var key = rootId + separator + folderNames.join(separator) + separator + lastPath;
          var objectName = domainName + ":" + mbeanName;

          if (folder) {
            folder = this.folderGetOrElse(folder, lastPath);
            if (folder) {
              // lets add the various data into the folder
              folder.entries = entries;
              folder.key = key;
              angular.bind(this, configureFolder, folder, lastPath)();
              folder.title = trimQuotes(lastPath);
              folder.objectName = objectName;
              folder.mbean = domain[mbeanName];
              folder.typeName = typeName;

              var addFolderByDomain = function(owner, typeName) {
                var map = owner[typeName];
                if (!map) {
                  map = {};
                  owner[typeName] = map;
                }
                var value = map[domainName];
                if (!value) {
                  map[domainName] = folder;
                } else {
                  var array = null;
                  if (angular.isArray(value)) {
                    array = value;
                  } else {
                    array = [value];
                    map[domainName] = array;
                  }
                  array.push(folder);
                }
              };

              if (serviceName) {
                angular.bind(this, addFolderByDomain, this.mbeanServicesToDomain, serviceName)();
              }
              if (typeName) {
                angular.bind(this, addFolderByDomain, this.mbeanTypesToDomain, typeName)();
              }
            }
          } else {
            log.info("No folder found for lastPath: " + lastPath);
          }
        }

      }

      tree.sortChildren(true);

      // now lets mark the nodes with no children as lazy loading...
      this.enableLazyLoading(tree);
      this.tree = tree;

      var processors = this.treePostProcessors.clone();
      processors.sort(function(e1, e2) { return e1.priority-e2.priority });

      angular.forEach(processors, (processor) => processor.processor(tree));

      this.maybeMonitorPlugins();

      var rootScope = this.$rootScope;
      if (rootScope) {
        rootScope.$broadcast('jmxTreeUpdated');
      }
    }

    private enableLazyLoading(folder: Folder) {
      var children = folder.children;
      if (children && children.length) {
        angular.forEach(children, (child) => {
          this.enableLazyLoading(child);
        })
      } else {
        // we have no children so enable lazy loading if we have a custom loader registered
        var lazyFunction = Jmx.findLazyLoadingFunction(this, folder);
        if (lazyFunction) {
          folder.isLazy = true;
        }
      }
    }

    /**
     * Returns the hash query argument to append to URL links
     * @method hash
     * @return {String}
     */
    public hash() {
      var hash = this.$location.search();
      var params = Core.hashToString(hash);
      if (params) {
        return "?" + params;
      }
      return "";
    }

    /**
     * Returns the currently active tab
     * @method getActiveTab
     * @return {Boolean}
     */
    public getActiveTab() {
      var workspace = this;
      return this.topLevelTabs.find((tab) => {
        if (!angular.isDefined(tab.isActive)) {
          return workspace.isLinkActive(tab.href());
        } else {
          return tab.isActive(workspace);
        }
      });
    }

    private getStrippedPathName():String {
      var pathName = Core.trimLeading((this.$location.path() || '/'), "#");
      pathName = Core.trimLeading(pathName, "/");
      return pathName;
    }

    public linkContains(...words:String[]):boolean {
      var pathName = this.getStrippedPathName();
      return words.all((word) => {
        return pathName.has(word);
      });
    }

    /**
     * Returns true if the given link is active. The link can omit the leading # or / if necessary.
     * The query parameters of the URL are ignored in the comparison.
     * @method isLinkActive
     * @param {String} href
     * @return {Boolean} true if the given link is active
     */
    public isLinkActive(href:string):boolean {
      // lets trim the leading slash
      var pathName = this.getStrippedPathName();

      var link = Core.trimLeading(href, "#");
      link = Core.trimLeading(link, "/");
      // strip any query arguments
      var idx = link.indexOf('?');
      if (idx >= 0) {
        link = link.substring(0, idx);
      }
      if (!pathName.length) {
        return link === pathName;
      } else {
        return pathName.startsWith(link);
      }
    }

    /**
     * Returns true if the given link is active. The link can omit the leading # or / if necessary.
     * The query parameters of the URL are ignored in the comparison.
     * @method isLinkActive
     * @param {String} href
     * @return {Boolean} true if the given link is active
     */
    public isLinkPrefixActive(href:string):boolean {
      // lets trim the leading slash
      var pathName = this.getStrippedPathName();

      var link = Core.trimLeading(href, "#");
      link = Core.trimLeading(link, "/");
      // strip any query arguments
      var idx = link.indexOf('?');
      if (idx >= 0) {
        link = link.substring(0, idx);
      }
      return pathName.startsWith(link);
    }


    /**
     * Returns true if the tab query parameter is active or the URL starts with the given path
     * @method isTopTabActive
     * @param {String} path
     * @return {Boolean}
     */
    public isTopTabActive(path:string):boolean {
      var tab = this.$location.search()['tab'];
      if (angular.isString(tab)) {
        return tab.startsWith(path);
      }
      return this.isLinkActive(path);
    }

    /**
     * Returns the selected mbean name if there is one
     * @method getSelectedMBeanName
     * @return {String}
     */
    public getSelectedMBeanName():string {
      var selection = this.selection;
      if (selection) {
        return selection.objectName;
      }
      return null;
    }

    /**
     * Returns true if the path is valid for the current selection
     * @method validSelection
     * @param {String} uri
     * @return {Boolean}
     */
    public validSelection(uri:string) {
      var workspace = this;
      var filter = (t) => {
        var fn = t.href;
        if (fn) {
          var href = fn();
          if (href) {
            if (href.startsWith("#/")) {
              href = href.substring(2);
            }
            return href === uri;
          }
        }
        return false;
      };
      var tab = this.subLevelTabs.find(filter);
      if (!tab) {
        tab = this.topLevelTabs.find(filter);
      }
      if (tab) {
        //console.log("Found tab " + JSON.stringify(tab));
        var validFn = tab['isValid'];
        return !angular.isDefined(validFn) || validFn(workspace);
      } else {
        log.info("Could not find tab for " + uri);
        return false;
      }
  /*
      var value = this.uriValidations[uri];
      if (value) {
        if (angular.isFunction(value)) {
          return value();
        }
      }
      return true;
  */
    }

    /**
     * In cases where we have just deleted something we typically want to change
     * the selection to the parent node
     * @method removeAndSelectParentNode
     */
    public removeAndSelectParentNode() {
      var selection = this.selection;
      if (selection) {
        var parent = selection.parent;
        if (parent) {
          // lets remove the selection from the parent so we don't do any more JMX attribute queries on the children
          // or include it in table views etc
          // would be nice to eagerly remove the tree node too?
          var idx = parent.children.indexOf(selection);
          if (idx < 0) {
            idx = parent.children.findIndex(n =>
              n.key === selection.key
            );
          }
          if (idx >= 0) {
            parent.children.splice(idx, 1);
          }
          this.updateSelectionNode(parent);
        }
      }
    }

    public selectParentNode() {
      var selection = this.selection;
      if (selection) {
        var parent = selection.parent;
        if (parent) {
          this.updateSelectionNode(parent);
        }
      }
    }

    /**
     * Returns the view configuration key for the kind of selection
     * for example based on the domain and the node type
     * @method selectionViewConfigKey
     * @return {String}
     */
    public selectionViewConfigKey():string {
      return this.selectionConfigKey("view/");
    }

    /**
     * Returns a configuration key for a node which is usually of the form
     * domain/typeName or for folders with no type, domain/name/folder
     * @method selectionConfigKey
     * @param {String} prefix
     * @return {String}
     */
    public selectionConfigKey(prefix: string = ""):string {
      var key:string = null;
      var selection = this.selection;
      if (selection) {
        // lets make a unique string for the kind of select
        key = prefix + selection.domain;
        var typeName = selection.typeName;
        if (!typeName) {
          typeName = selection.title;
        }
        key += "/" + typeName;
        if (selection.isFolder()) {
          key += "/folder";
        }
      }
      return key;
    }

    public moveIfViewInvalid() {
      var workspace = this;
      var uri = Core.trimLeading(this.$location.path(), "/");
      if (this.selection) {
        var key = this.selectionViewConfigKey();
        if (this.validSelection(uri)) {
          // lets remember the previous selection
          this.setLocalStorage(key, uri);
          return false;
        } else {
          log.info("the uri '" + uri + "' is not valid for this selection");
          // lets look up the previous preferred value for this type
          var defaultPath = this.getLocalStorage(key);
          if (!defaultPath || !this.validSelection(defaultPath)) {
            // lets find the first path we can find which is valid
            defaultPath = null;
            angular.forEach(this.subLevelTabs, (tab) => {
              var fn = tab.isValid;
              if (!defaultPath && tab.href && angular.isDefined(fn) && fn(workspace)) {
                defaultPath = tab.href();
              }
            });
          }
          if (!defaultPath) {
            defaultPath = "#/jmx/help";
          }
          log.info("moving the URL to be " + defaultPath);
          if (defaultPath.startsWith("#")) {
            defaultPath = defaultPath.substring(1);
          }
          this.$location.path(defaultPath);
          return true;
        }
      } else {
        return false;
      }
    }

    public updateSelectionNode(node) {
      var originalSelection = this.selection;
      this.selection = <NodeSelection> node;
      var key:string = null;
      if (node) {
        key = node['key'];
      }
      var $location = this.$location;
      var q = $location.search();
      if (key) {
        q['nid'] = key
      }
      $location.search(q);

      // if we have updated the selection (rather than just loaded a page)
      // lets use the previous preferred view - otherwise we may be loading
      // a page from a bookmark so lets not change the view :)
      if (originalSelection) {
        key = this.selectionViewConfigKey();
        if (key) {
          var defaultPath = this.getLocalStorage(key);
          if (defaultPath) {
            this.$location.path(defaultPath);
          }
        }
      }
    }

    /**
     * Redraws the tree widget
     * @method redrawTree
     */
    public redrawTree() {
      var treeElement:any = this.treeElement;
      if (treeElement && angular.isDefined(treeElement.dynatree) && angular.isFunction(treeElement.dynatree)) {
        var node:any = treeElement.dynatree("getTree");
        if (angular.isDefined(node)) {
          try {
            node.reload();
          } catch (e) {
            // ignore as we may get an error if starting hawtio from incognito window on chrome
          }
        }
      }
    }


    /**
     * Expand / collapse the current active node
     * @method expandSelection
     * @param {Boolean} flag
     */
    public expandSelection(flag) {
      var treeElement:any = this.treeElement;
      if (treeElement && angular.isDefined(treeElement.dynatree) && angular.isFunction(treeElement.dynatree)) {
        var node:DynaTreeNode = treeElement.dynatree("getActiveNode");
        if (angular.isDefined(node)) {
          node.expand(flag);
        }
      }
    }

    private matchesProperties(entries, properties) {
      if (!entries) return false;
      for (var key in properties) {
        var value = properties[key];
        if (!value || entries[key] !== value) {
          return false;
        }
      }
      return true;
    }

    public hasInvokeRightsForName(objectName:string, ...methods:Array<string>) {
      // allow invoke by default, same as in hasInvokeRight() below???
      var canInvoke = true;
      if (objectName) {
        var mbean = Core.parseMBean(objectName);
        if (mbean) {
          var mbeanFolder = this.findMBeanWithProperties(mbean.domain, mbean.attributes);
          if (mbeanFolder) {
            return this.hasInvokeRights.apply(this, [mbeanFolder].concat(methods));
          } else {
            log.debug("Failed to find mbean folder with name " + objectName);
          }
        } else {
          log.debug("Failed to parse mbean name " + objectName);
        }
      }
      return canInvoke;
    }

    public hasInvokeRights(selection:Core.NodeSelection, ...methods:Array<string>) {
      var canInvoke = true;
      if (selection) {
        var selectionFolder = <Core.Folder> selection;
        var mbean = selectionFolder.mbean;
        if (mbean) {
          if (angular.isDefined(mbean.canInvoke)) {
            canInvoke = mbean.canInvoke;
          }
          if (canInvoke && methods && methods.length > 0) {
            var opsByString = mbean['opByString'];
            var ops = mbean['op'];
            if (opsByString && ops) {
              methods.forEach((method) => {
                if (!canInvoke) {
                  return;
                }
                var op = null;
                if (method.endsWith(')')) {
                  op = opsByString[method];
                } else {
                  op = ops[method];
                }
                if (!op) {
                  log.debug("Could not find method:", method, " to check permissions, skipping");
                  return;
                }
                canInvoke = this.resolveCanInvoke(op);
              });
            }
          }
        }
      } 
      return canInvoke;
    }

    private resolveCanInvoke(op) {
      // for single method
      if (!angular.isArray(op)) {
        if (angular.isDefined(op.canInvoke)) {
          return op.canInvoke;
        } else {
          return true;
        }
      }

      // for overloaded methods
      // returns true only if all overloaded methods can be invoked (i.e. canInvoke=true)
      var cantInvoke = (<Array<any>> op).find((o) =>
        angular.isDefined(o.canInvoke) && !o.canInvoke
      );
      return !angular.isDefined(cantInvoke);
    }

    public treeContainsDomainAndProperties(domainName, properties = null) {
      var workspace = this;
      var tree = workspace.tree;
      if (tree) {
        var folder = tree.get(domainName);
        if (folder) {
          if (properties) {
            var children = folder.children || [];
            var checkProperties = (node)  => {
              if (!this.matchesProperties(node.entries, properties)) {
                if (node.domain === domainName && node.children && node.children.length > 0) {
                  return node.children.some(checkProperties);
                } else {
                  return false;
                }
              } else {
                return true;
              }
            };
            return children.some(checkProperties);
          }
          return true;
        } else {
          // console.log("no hasMBean for " + objectName + " in tree " + tree);
        }
      } else {
        // console.log("workspace has no tree! returning false for hasMBean " + objectName);
      }
      return false;
    }

    private matches(folder, properties, propertiesCount) {
      if (folder) {
        var entries = folder.entries;
        if (properties) {
          if (!entries) return false;
          for (var key in properties) {
            var value = properties[key];
            if (!value || entries[key] !== value) {
              return false;
            }
          }
        }
        if (propertiesCount) {
          return entries && Object.keys(entries).length === propertiesCount;
        }
        return true;
      }
      return false;
    }

    // only display stuff if we have an mbean with the given properties
    public hasDomainAndProperties(domainName, properties = null, propertiesCount = null) {
      var node = this.selection;
      if (node) {
        return this.matches(node, properties, propertiesCount) && node.domain === domainName;
      }
      return false;
    }

    // only display stuff if we have an mbean with the given properties
    public findMBeanWithProperties(domainName, properties = null, propertiesCount = null) {
      var tree = this.tree;
      if (tree) {
          return this.findChildMBeanWithProperties(tree.get(domainName), properties, propertiesCount);
      }
      return null;
    }

    public findChildMBeanWithProperties(folder, properties = null, propertiesCount = null) {
      var workspace = this;
      if (folder) {
        var children = folder.children;
        if (children) {
          var answer = children.find(node => this.matches(node, properties, propertiesCount));
          if (answer) {
            return answer;
          }
          return children.map(node => workspace.findChildMBeanWithProperties(node, properties, propertiesCount)).find(node => node);
        }
      }
      return null;
    }

    public selectionHasDomainAndLastFolderName(objectName: string, lastName: string) {
      var lastNameLower = (lastName || "").toLowerCase();
      function isName(name) {
        return (name || "").toLowerCase() === lastNameLower
      }
      var node = this.selection;
      if (node) {
        if (objectName === node.domain) {
          var folders = node.folderNames;
          if (folders) {
            var last = folders.last();
            return (isName(last) || isName(node.title)) && node.isFolder() && !node.objectName;
          }
        }
      }
      return false;
    }

    public selectionHasDomain(domainName: string) {
      var node = this.selection;
      if (node) {
        return domainName === node.domain;
      }
      return false;
    }

    public selectionHasDomainAndType(objectName: string, typeName: string) {
      var node = this.selection;
      if (node) {
        return objectName === node.domain && typeName === node.typeName;
      }
      return false;
    }

    /**
     * Returns true if this workspace has any mbeans at all
     */
    hasMBeans() {
      var answer = false;
      var tree = this.tree;
      if (tree) {
        var children = tree.children;
        if (angular.isArray(children) && children.length > 0) {
          answer = true;
        }
      }
      return answer;
    }
    hasFabricMBean() {
      return this.hasDomainAndProperties('io.fabric8', {type: 'Fabric'});
    }
    isFabricFolder() {
      return this.hasDomainAndProperties('io.fabric8');
    }

    isCamelContext(camelJmxDomain) {
      return this.hasDomainAndProperties(camelJmxDomain, {type: 'context'});
    }
    isCamelFolder(camelJmxDomain) {
      return this.hasDomainAndProperties(camelJmxDomain);
    }
    isComponentsFolder(camelJmxDomain) {
      return this.selectionHasDomainAndLastFolderName(camelJmxDomain, 'components');
    }
    isComponent(camelJmxDomain) {
      return this.hasDomainAndProperties(camelJmxDomain, {type: 'components'});
    }
    isEndpointsFolder(camelJmxDomain) {
      return this.selectionHasDomainAndLastFolderName(camelJmxDomain, 'endpoints');
    }
    isEndpoint(camelJmxDomain) {
      return this.hasDomainAndProperties(camelJmxDomain, {type: 'endpoints'});
    }
    isDataFormatsFolder(camelJmxDomain) {
      return this.selectionHasDomainAndLastFolderName(camelJmxDomain, 'dataformats');
    }
    isDataFormat(camelJmxDomain) {
      return this.hasDomainAndProperties(camelJmxDomain, {type: 'dataformats'});
    }
    isRoutesFolder(camelJmxDomain) {
      return this.selectionHasDomainAndLastFolderName(camelJmxDomain, 'routes')
    }
    isRoute(camelJmxDomain) {
      return this.hasDomainAndProperties(camelJmxDomain, {type: 'routes'});
    }

    isOsgiFolder() {
      return this.hasDomainAndProperties('osgi.core');
    }
    isKarafFolder() {
      return this.hasDomainAndProperties('org.apache.karaf');
    }
    isOsgiCompendiumFolder() {
      return this.hasDomainAndProperties('osgi.compendium');
    }
  }


}

// TODO refactor other code to use Core.Workspace
class Workspace extends Core.Workspace {};
