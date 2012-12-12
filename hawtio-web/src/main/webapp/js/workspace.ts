interface NodeSelection {
  title: string;
  objectName?: string;
  domain?: string;
  entries?: any;
  folderNames?: string[];
  children?:NodeSelection[];
  parent?: NodeSelection;

  get(key: string): NodeSelection;
}

class Workspace {
  public jolokia = null;
  public updateRate = 0;
  public operationCounter = 0;
  public selection:NodeSelection = null;
  public tree = null;
  public domainToHealth = {};
  dummyStorage = {};
  uriValidations = null;

  constructor(public url:string, public $location:any, public $compile, public $templateCache) {
    //constructor(public url: string, public $location: angular.ILocationService) {
    var rate = this.getUpdateRate();
    this.jolokia = new Jolokia(url);
    console.log("Jolokia URL is " + url);
    this.setUpdateRate(rate);
    this.uriValidations = {
      'chartEdit': () => $location.path() === "/charts",

      // health check
      // TODO replace with attempt to find one or more mbeans...
      'status': () => this.isActiveMQFolder() || this.isFabricFolder(),

      // activemq
      'browseQueue': () => this.isQueue(),
      'browseEndpoint': () => this.isEndpoint(),
      'sendMessage': () => this.isQueue() || this.isTopic() || this.isEndpoint(),
      'subscribers': () => this.isActiveMQFolder(),
      'createQueue': () => this.isQueuesFolder(),
      'createTopic': () => this.isTopicsFolder(),
      'deleteQueue': () => this.isQueue(),
      'deleteTopic': () => this.isTopic(),

      // camel
      'routes': () => this.isCamelFolder(),
      'createEndpoint': () => this.isEndpointsFolder(),

      // osgi
      'bundles': () => this.isOsgiFolder()
    };

  }


  getLocalStorage(key:string) {
    if (supportsLocalStorage()) {
      return localStorage[key];
    }
    return this.dummyStorage[key];
  }

  setLocalStorage(key:string, value:any) {
    if (supportsLocalStorage()) {
      localStorage[key] = value;
    } else {
      this.dummyStorage[key] = value;
    }
  }

  getUpdateRate() {
    return this.getLocalStorage('updateRate') || 5000;
  }

  /**
   * sets the update rate
   */
  public setUpdateRate(value) {
    this.jolokia.stop();
    this.setLocalStorage('updateRate', value)
    if (value > 0) {
      this.jolokia.start(value);
    }
    console.log("Set update rate to: " + value);
  }

  /**
   * Returns true if the path is valid for the current selection
   */
  public validSelection(uri:string) {
    var value = this.uriValidations[uri];
    if (value) {
      if (angular.isFunction(value)) {
        return value();
      }
    }
    return true;
  }

  public moveIfViewInvalid() {
    var uri = this.$location.path().substring(1);
    if (!this.validSelection(uri) && this.selection) {
      var defaultPath = "attributes";
      if (this.isActiveMQFolder()) {
        defaultPath = "activemq/status";
      }
      this.$location.path(defaultPath);
    }
    return false;
  }

  // only display stuff if we have an mbean with the given properties
  public hasDomainAndProperties(objectName, properties = null) {
    var workspace = this;
    var tree = workspace.tree;
    var node = workspace.selection;
    if (tree && node) {
      var folder = tree.get(objectName);
      if (folder) {
        if (objectName !== node.domain) return false;
        if (properties) {
          var entries = node.entries;
          if (!entries) return false;
          for (var key in properties) {
            var value = properties[key];
            if (!value || entries[key] !== value) {
              return false;
            }
          }
        }
        return true
      } else {
        // console.log("no hasMBean for " + objectName + " in tree " + tree);
      }
    } else {
      // console.log("workspace has no tree! returning false for hasMBean " + objectName);
    }
    return false;
  }

  public hasDomainAndLastPath(objectName, lastName) {
    var workspace = this;
    var node = workspace.selection;
    if (node) {
      if (objectName === node.domain) {
        var folders = node.folderNames;
        if (folders) {
          var last = folders.last();
          return last === lastName;
        }
      }
    }
    return false;
  }

  isQueue() {
    return this.hasDomainAndProperties('org.apache.activemq', {Type: 'Queue'});
  }

  isTopic() {
    return this.hasDomainAndProperties('org.apache.activemq', {Type: 'Topic'});
  }

  isQueuesFolder() {
    return this.hasDomainAndLastPath('org.apache.activemq', 'Queue')
  }

  isTopicsFolder() {
    return this.hasDomainAndLastPath('org.apache.activemq', 'Topic')
  }

  isActiveMQFolder() {
    return this.hasDomainAndProperties('org.apache.activemq');
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
    return this.hasDomainAndLastPath('org.apache.camel', 'endpoints');
  }

  isEndpoint() {
    return this.hasDomainAndProperties('org.apache.camel', {type: 'endpoints'});
  }

  isRoutesFolder() {
    return this.hasDomainAndLastPath('org.apache.camel', 'routes')
  }

  isOsgiFolder() {
    return this.hasDomainAndProperties('osgi.core');
  }
}

class Folder implements NodeSelection {
  constructor(public title:string) {
    this.addClass = escapeDots(title);
  }

  isFolder = true;
  key:string = null;
  children:NodeSelection[] = [];
  folderNames:string[] = [];
  domain:string = null;
  map = {};
  addClass = null;

  get(key:string):NodeSelection {
    return this.map[key];
  }

  /**
   * Navigates the given paths and returns the value there or null if no value could be found
   */
  public navigate(...paths:string[]) {
    var node: NodeSelection = this;
    paths.forEach((path) => {
      if (node) {
        node = node.get(path);
      }
    });
    return node;
  }

  getOrElse(key:string, defaultValue:NodeSelection = new Folder(key)):Folder {
    var answer = this.map[key];
    if (!answer) {
      answer = defaultValue;
      this.map[key] = answer;
      this.children.push(answer);
      this.children = this.children.sortBy("title");
    }
    return answer;
  }
}
