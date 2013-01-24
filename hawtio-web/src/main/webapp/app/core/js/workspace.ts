interface MenuItem {
  content: string;
  title?: string;
  isValid: () => any;
  isActive?: () => bool;
  href: () => any;
}

class Workspace {
  public operationCounter = 0;
  public selection:NodeSelection;
  public tree = null;
  public mbeanTypesToDomain = {};
  public mbeanServicesToDomain = {};
  public attributeColumnDefs = {};
  public topLevelTabs = [];
  public subLevelTabs = [];

  uriValidations = null;

  constructor(public jolokia, 
              public $location:ng.ILocationService, 
              public $compile:ng.ICompileService, 
              public $templateCache:ng.ITemplateCacheService, 
              public localStorage:WindowLocalStorage) {

    // TODO Is there a way to remove this logic from here?
    this.uriValidations = {
      'chartEdit': () => $location.path() === "/charts"
    };

  }

  getLocalStorage(key:string) {
    return this.localStorage[key];
  }

  setLocalStorage(key:string, value:any) {
    this.localStorage[key] = value;
  }

  /**
   * Returns the hash query argument to append to URL links
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
   * Returns true if the given link is active. The link can omit the leading # or / if necessary.
   * The query parameters of the URL are ignored in the comparison.
   *
   * @param href
   * @return true if the given link is active
   */
  public isLinkActive(href:string):bool {
    // lets trim the leading slash
    var pathName = (this.$location.path() || '/').substring(1);
    var link = Core.trimLeading(href, "#");
    link = Core.trimLeading(href, "/");
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
   * Returns true if the tab query parameter is active or the URL starts with the given path
   */
  public isTopTabActive(path:string):bool {
    var tab = this.$location.search()['tab'];
    if (angular.isString(tab)) {
      return tab.startsWith(path);
    }
    return this.isLinkActive(path);
  }

  /**
   * Returns the selected mbean name if there is one
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
   */
  public validSelection(uri:string) {
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
      var validFn = tab.isValid;
      return !validFn || validFn();
    } else {
      console.log("Could not find tab for " + uri);
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
   * Returns the view configuration key for the kind of selection
   * for example based on the domain and the node type
   */
  public selectionViewConfigKey():string {
    return this.selectionConfigKey("view/");
  }

  /**
   * Returns a configuration key for a node which is usually of the form
   * domain/typeName or for folders with no type, domain/name/folder
   */
  public selectionConfigKey(prefix: string = ""):string {
    var key = null;
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
    var uri = this.$location.path().substring(1);
    if (this.selection) {
      var key = this.selectionViewConfigKey();
      if (this.validSelection(uri)) {
        // lets remember the previous selection
        this.setLocalStorage(key, uri);
        return false;
      } else {
        console.log("the uri '" + uri + "' is not valid for this selection");
        // lets look up the previous preferred value for this type
        var defaultPath = this.getLocalStorage(key);
        if (!defaultPath || !this.validSelection(defaultPath)) {
          // lets find the first path we can find which is valid
          defaultPath = null;
          angular.forEach(this.subLevelTabs, (tab) => {
            var fn = tab.isValid;
            if (!defaultPath && tab.href && fn && fn()) {
              defaultPath = tab.href();
            }
          });
        }
        if (!defaultPath) {
          defaultPath = "#/jmx/help";
        }
        console.log("moving the URL to be " + defaultPath);
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
    var key = null;
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

  public treeContainsDomainAndProperties(domainName, properties = null) {
    var workspace = this;
    var tree = workspace.tree;
    if (tree) {
      var folder = tree.get(domainName);
      if (folder) {
        if (properties) {
          var children = folder.children || [];
          return children.some((node) => this.matchesProperties(node.entries, properties));
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


  public selectionHasDomainAndLastFolderName(objectName: string, lastName: string) {
    var node = this.selection;
    if (node) {
      if (objectName === node.domain) {
        var folders = node.folderNames;
        if (folders) {
          var last = folders.last();
          return last === lastName && node.isFolder() && !node.objectName;
        }
      }
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

  hasFabricMBean() {
    return this.hasDomainAndProperties('org.fusesource.fabric', {type: 'Fabric'});
  }

  isFabricFolder() {
    return this.hasDomainAndProperties('org.fusesource.fabric');
  }

  isCamelContext() {
    return this.hasDomainAndProperties('org.apache.camel', {type: 'context'});
  }

  isCamelFolder() {
    return this.hasDomainAndProperties('org.apache.camel');
  }

  isEndpointsFolder() {
    return this.selectionHasDomainAndLastFolderName('org.apache.camel', 'endpoints');
  }

  isEndpoint() {
    return this.hasDomainAndProperties('org.apache.camel', {type: 'endpoints'});
  }

  isRoutesFolder() {
    return this.selectionHasDomainAndLastFolderName('org.apache.camel', 'routes')
  }

  isRoute() {
    return this.hasDomainAndProperties('org.apache.camel', {type: 'routes'});
  }

  isOsgiFolder() {
    return this.hasDomainAndProperties('osgi.core');
  }

    isOsgiCompendiumFolder() {
        return this.hasDomainAndProperties('osgi.compendium');
    }
}

