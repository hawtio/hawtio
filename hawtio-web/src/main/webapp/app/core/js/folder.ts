// Lets use a NodeSelection interface so we can expose things like the objectName and the MBean's entries
interface NodeSelection {
  title: string;
  typeName?: string;
  objectName?: string;
  domain?: string;
  entries?: any;
  folderNames?: string[];
  children?:NodeSelection[];
  parent?: NodeSelection;
  isFolder?: () => bool;

  get(key:string): NodeSelection;

  ancestorHasType(typeName:string): bool;
  ancestorHasEntry(key:string, value): bool;
}


class Folder implements NodeSelection {
  constructor(public title:string) {
    this.addClass = escapeDots(title);
  }

  key:string = null;
  typeName:string = null;
  children:NodeSelection[] = [];
  folderNames:string[] = [];
  domain:string = null;
  objectName:string = null;
  map = {};
  entries = {};
  addClass = null;
  parent: Folder = null;


  get(key:string):NodeSelection {
    return this.map[key];
  }

  isFolder() {
    return this.children.length > 0;
  }
  /**
   * Navigates the given paths and returns the value there or null if no value could be found
   */
  public navigate(...paths:string[]) {
    var node:NodeSelection = this;
    paths.forEach((path) => {
      if (node) {
        node = node.get(path);
      }
    });
    return node;
  }

  public hasEntry(key:string, value) {
    var entries = this.entries;
    if (entries) {
      var actual = entries[key];
      return actual && value === actual;
    }
    return false;
  }

  public parentHasEntry(key:string, value) {
    if (this.parent) {
      return this.parent.hasEntry(key, value);
    }
    return false;
  }

  public ancestorHasEntry(key:string, value) {
    var parent = this.parent;
    while (parent) {
      if (parent.hasEntry(key, value))
        return true;
      parent = parent.parent;
    }
    return false;
  }

  public ancestorHasType(typeName:string) {
    var parent = this.parent;
    while (parent) {
      if (typeName === parent.typeName)
        return true;
      parent = parent.parent;
    }
    return false;
  }

  public getOrElse(key:string, defaultValue:NodeSelection = new Folder(key)):Folder {
    var answer = this.map[key];
    if (!answer) {
      answer = defaultValue;
      this.map[key] = answer;
      this.children.push(answer);
      answer.parent = this;
      this.children = this.children.sortBy("title");
    }
    return answer;
  }

  public sortChildren(recursive: bool) {
    var children = this.children;
    if (children) {
      this.children = children.sortBy("title");
      if (recursive) {
        angular.forEach(children, (child) => child.sortChildren(recursive));
      }
    }
  }

}